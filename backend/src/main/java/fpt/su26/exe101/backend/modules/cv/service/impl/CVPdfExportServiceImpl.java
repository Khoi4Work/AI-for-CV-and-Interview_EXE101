package fpt.su26.exe101.backend.modules.cv.service.impl;

import fpt.su26.exe101.backend.base.enums.UserPlan;
import fpt.su26.exe101.backend.base.exception.ApiException;
import fpt.su26.exe101.backend.base.exception.ErrorCode;
import fpt.su26.exe101.backend.modules.cv.dto.request.CVPdfExportRequestDTO;
import fpt.su26.exe101.backend.modules.cv.entity.CVTemplate;
import fpt.su26.exe101.backend.modules.cv.policy.TemplateAccessPolicy;
import fpt.su26.exe101.backend.modules.cv.repository.CVTemplateRepository;
import fpt.su26.exe101.backend.modules.cv.service.CVPdfExportService;
import fpt.su26.exe101.backend.modules.gallery.entity.Gallery;
import fpt.su26.exe101.backend.modules.quota.service.UsageQuotaService;
import org.apache.tika.Tika;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import lombok.extern.slf4j.Slf4j;

import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.stream.Stream;
import java.time.Duration;
import java.util.Comparator;
import java.util.List;
import java.util.Locale;
import java.util.concurrent.TimeUnit;

@Service
@Slf4j
public class CVPdfExportServiceImpl implements CVPdfExportService {

    private static final int MAX_HTML_BYTES = 4 * 1024 * 1024;
    private static final Duration RENDER_TIMEOUT = Duration.ofSeconds(45);

    private final CVTemplateRepository templateRepository;
    private final UsageQuotaService quotaService;
    private final Tika tika = new Tika();

    @Value("${cv.pdf.chrome-binary:}")
    private String configuredChromeBinary;

    public CVPdfExportServiceImpl(CVTemplateRepository templateRepository, UsageQuotaService quotaService) {
        this.templateRepository = templateRepository;
        this.quotaService = quotaService;
    }

    @Override
    @Transactional(readOnly = true)
    public byte[] export(CVPdfExportRequestDTO request, Gallery gallery) {
        validateRequest(request);
        validateTemplateAccess(request.getTemplateId(), gallery);

        Path workDirectory = null;
        try {
            workDirectory = Files.createTempDirectory("cv-pdf-export-");
            Path htmlFile = workDirectory.resolve("cv.html");
            Path pdfFile = workDirectory.resolve("cv.pdf");
            Path browserLog = workDirectory.resolve("chrome.log");
            Files.writeString(htmlFile, request.getHtml(), StandardCharsets.UTF_8);

            List<String> command = List.of(
                    resolveChromeBinary(),
                    "--headless=new",
                    "--disable-gpu",
                    "--no-sandbox",
                    "--disable-dev-shm-usage",
                    "--disable-extensions",
                    "--disable-javascript",
                    "--no-first-run",
                    "--no-default-browser-check",
                    "--no-pdf-header-footer",
                    "--run-all-compositor-stages-before-draw",
                    "--virtual-time-budget=5000",
                    "--user-data-dir=" + workDirectory.resolve("profile").toAbsolutePath(),
                    "--print-to-pdf=" + pdfFile.toAbsolutePath(),
                    htmlFile.toUri().toString());

            Process process = new ProcessBuilder(command)
                    .redirectErrorStream(true)
                    .redirectOutput(browserLog.toFile())
                    .start();
            if (!process.waitFor(RENDER_TIMEOUT.toSeconds(), TimeUnit.SECONDS)) {
                process.destroyForcibly();
                throw new IOException("Chromium PDF export timed out.");
            }
            if (process.exitValue() != 0 || !Files.isRegularFile(pdfFile) || Files.size(pdfFile) == 0) {
                String details = Files.exists(browserLog) ? Files.readString(browserLog) : "No Chromium output was produced.";
                log.error("[CV PDF] Chromium export failed | exitCode={} | details={}", process.exitValue(), details);
                throw new IOException("Chromium did not produce a PDF file.");
            }

            byte[] pdfBytes = Files.readAllBytes(pdfFile);
            String extractedText = tika.parseToString(new ByteArrayInputStream(pdfBytes));
            if (!StringUtils.hasText(extractedText)) {
                throw new IOException("Generated PDF has no extractable text.");
            }
            log.info("[CV PDF] Exported text-based PDF | galleryId={} | templateId={} | bytes={} | extractedCharacters={}",
                    gallery.getId(), request.getTemplateId(), pdfBytes.length, extractedText.length());
            return pdfBytes;
        } catch (ApiException exception) {
            throw exception;
        } catch (Exception exception) {
            log.error("[CV PDF] Export failed | galleryId={} | templateId={} | errorType={}",
                    gallery.getId(), request.getTemplateId(), exception.getClass().getSimpleName(), exception);
            throw new ApiException(ErrorCode.SERVICE_UNAVAILABLE,
                    "Chưa thể xuất PDF lúc này. Vui lòng thử lại sau.");
        } finally {
            deleteDirectory(workDirectory);
        }
    }

    private void validateRequest(CVPdfExportRequestDTO request) {
        if (request == null || !StringUtils.hasText(request.getHtml())
                || !StringUtils.hasText(request.getTemplateId())) {
            throw new ApiException(ErrorCode.INVALID_INPUT, "Thiếu nội dung hoặc mẫu CV để xuất PDF.");
        }
        if (request.getHtml().getBytes(StandardCharsets.UTF_8).length > MAX_HTML_BYTES) {
            throw new ApiException(ErrorCode.INVALID_INPUT, "Nội dung CV vượt quá giới hạn xuất PDF.");
        }
        String html = request.getHtml().toLowerCase(Locale.ROOT);
        if (!html.contains("<html") || !html.contains(".cv-page-container")) {
            throw new ApiException(ErrorCode.INVALID_INPUT, "Nội dung CV không hợp lệ để xuất PDF.");
        }
    }

    private void validateTemplateAccess(String templateId, Gallery gallery) {
        CVTemplate template = templateRepository.findById(templateId)
                .orElseThrow(() -> new ApiException(ErrorCode.RESOURCE_NOT_FOUND, "Không tìm thấy mẫu CV."));
        UserPlan plan = quotaService.getCvPlan(gallery.getAccountId());
        if (!TemplateAccessPolicy.canUse(plan, template.getMinimumPlan())) {
            throw new ApiException(ErrorCode.FORBIDDEN_ACTION, "Gói hiện tại chưa hỗ trợ mẫu CV đang chọn.");
        }
    }

    private String resolveChromeBinary() {
        if (StringUtils.hasText(configuredChromeBinary)) {
            return configuredChromeBinary;
        }
        String os = System.getProperty("os.name", "").toLowerCase(Locale.ROOT);
        if (os.contains("win")) {
            String programFiles = System.getenv("ProgramFiles");
            String localAppData = System.getenv("LOCALAPPDATA");
            List<Path> candidates = List.of(
                    Path.of(programFiles == null ? "C:/Program Files" : programFiles, "Google/Chrome/Application/chrome.exe"),
                    Path.of(localAppData == null ? "C:/Users/Default/AppData/Local" : localAppData, "Google/Chrome/Application/chrome.exe"));
            return candidates.stream().filter(Files::isExecutable).map(Path::toString).findFirst()
                    .orElseThrow(() -> new ApiException(ErrorCode.SERVICE_UNAVAILABLE,
                            "Không tìm thấy Chromium để xuất PDF. Hãy cấu hình CHROME_BIN cho máy chủ."));
        }
        List<Path> candidates = List.of(Path.of("/usr/bin/google-chrome"), Path.of("/usr/bin/chromium"),
                Path.of("/usr/bin/chromium-browser"));
        return candidates.stream().filter(Files::isExecutable).map(Path::toString).findFirst()
                .orElseThrow(() -> new ApiException(ErrorCode.SERVICE_UNAVAILABLE,
                        "Không tìm thấy Chromium để xuất PDF. Hãy cấu hình CHROME_BIN cho máy chủ."));
    }

    private void deleteDirectory(Path directory) {
        if (directory == null || !Files.exists(directory)) return;
        try (Stream<Path> paths = Files.walk(directory)) {
            paths.sorted(Comparator.reverseOrder()).forEach(path -> {
                try {
                    Files.deleteIfExists(path);
                } catch (IOException exception) {
                    log.warn("[CV PDF] Could not remove temporary file | path={}", path);
                }
            });
        } catch (IOException exception) {
            log.warn("[CV PDF] Could not remove temporary export directory | path={}", directory);
        }
    }
}
