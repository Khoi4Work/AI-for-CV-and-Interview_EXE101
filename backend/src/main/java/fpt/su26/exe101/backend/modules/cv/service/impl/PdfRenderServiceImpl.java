package fpt.su26.exe101.backend.modules.cv.service.impl;

import fpt.su26.exe101.backend.base.exception.ApiException;
import fpt.su26.exe101.backend.base.exception.ErrorCode;
import fpt.su26.exe101.backend.modules.cv.client.PdfServiceClient;
import fpt.su26.exe101.backend.modules.cv.dto.PdfRenderOptions;
import fpt.su26.exe101.backend.modules.cv.dto.PdfRenderRequest;
import fpt.su26.exe101.backend.modules.cv.service.PdfRenderService;
import feign.FeignException;
import org.springframework.stereotype.Service;

import java.util.regex.Pattern;

/** Calls the separately deployed Chromium PDF service and returns the generated PDF bytes. */
@Service
public class PdfRenderServiceImpl implements PdfRenderService {
    private static final int MAX_HTML_LENGTH = 2_000_000;
    private static final Pattern SAFE_FILENAME = Pattern.compile("[\\p{L}\\p{N}._ -]*");

    private final PdfServiceClient pdfServiceClient;

    public PdfRenderServiceImpl(PdfServiceClient pdfServiceClient) {
        this.pdfServiceClient = pdfServiceClient;
    }

    /** Sends a self-contained HTML document and print options to POST /api/v1/pdf. */
    @Override
    public byte[] render(String html, String filename, PdfRenderOptions options) {
        if (html == null || html.isBlank()) {
            throw new ApiException(ErrorCode.INVALID_INPUT, "HTML CV không được để trống.");
        }
        if (html.length() > MAX_HTML_LENGTH) {
            throw new ApiException(ErrorCode.INVALID_INPUT, "HTML CV vượt quá giới hạn 2 MB.");
        }
        if (filename != null && (filename.length() > 120 || !SAFE_FILENAME.matcher(filename).matches())) {
            throw new ApiException(ErrorCode.INVALID_INPUT, "Tên file PDF không hợp lệ.");
        }

        PdfRenderRequest request = new PdfRenderRequest(html, filename, options);
        try {
            byte[] pdf = pdfServiceClient.render(request);

            if (pdf == null || pdf.length == 0) {
                throw new ApiException(ErrorCode.SERVICE_UNAVAILABLE, "PDF service trả về file rỗng.");
            }
            return pdf;
        } catch (FeignException exception) {
            ErrorCode errorCode = exception.status() >= 400 && exception.status() < 500
                    ? ErrorCode.INVALID_INPUT
                    : ErrorCode.SERVICE_UNAVAILABLE;
            throw new ApiException(errorCode,
                    exception.status() >= 400
                            ? "PDF service trả về HTTP " + exception.status() + "."
                            : "Không kết nối được PDF service.",
                    exception);
        }
    }
}
