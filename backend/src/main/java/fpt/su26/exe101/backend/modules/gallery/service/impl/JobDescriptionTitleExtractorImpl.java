package fpt.su26.exe101.backend.modules.gallery.service.impl;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import fpt.su26.exe101.backend.base.persistence.Prompt;
import fpt.su26.exe101.backend.base.service.AIChatCompletionService;
import fpt.su26.exe101.backend.modules.gallery.service.JobDescriptionTitleExtractor;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.util.Locale;
import java.util.Optional;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
@RequiredArgsConstructor
@Slf4j
public class JobDescriptionTitleExtractorImpl implements JobDescriptionTitleExtractor {
    private static final int MAX_INPUT_CHARS = 20_000;
    private static final int MAX_TITLE_CHARS = 255;
    private static final Pattern LABELED_TITLE = Pattern.compile(
            "(?im)^\\s*(?:vị trí|chức danh|job\\s*title|position|title)\\s*[:：–-]\\s*(.{2,255})$");

    private final AIChatCompletionService aiChatCompletionService;
    private final ObjectMapper objectMapper;

    @Override
    public String extractTitle(String jobDescription) {
        if (jobDescription == null || jobDescription.isBlank()) return "";

        String boundedDescription = jobDescription.substring(0, Math.min(jobDescription.length(), MAX_INPUT_CHARS));
        try {
            String response = requestTitleExtraction(boundedDescription);
            return parseExtractedTitle(response).orElseGet(() -> extractFromLabeledHeading(boundedDescription));
        } catch (RuntimeException | IOException exception) {
            log.warn("[GALLERY] JD title extraction failed | errorType={}", exception.getClass().getSimpleName());
            return extractFromLabeledHeading(boundedDescription);
        }
    }

    private String requestTitleExtraction(String jobDescription) {
        return aiChatCompletionService.generateJson(
                Prompt.jdTitleExtraction(jobDescription), null, 256, "gallery", "jd-title-extraction");
    }

    private Optional<String> parseExtractedTitle(String response) throws IOException {
        JsonNode titleNode = objectMapper.readTree(response).path("title");
        if (!titleNode.isTextual()) return Optional.empty();

        String title = normalizeTitle(titleNode.asText());
        return isGenericTitle(title) ? Optional.empty() : Optional.of(title);
    }

    private String extractFromLabeledHeading(String jobDescription) {
        Matcher matcher = LABELED_TITLE.matcher(jobDescription);
        if (!matcher.find()) return "";

        String title = normalizeTitle(matcher.group(1));
        return isGenericTitle(title) ? "" : title;
    }

    private String normalizeTitle(String value) {
        if (value == null) return "";

        String title = value.trim()
                .replaceAll("\\s+", " ")
                .replaceAll("^[\\p{Punct}\\s]+|[\\p{Punct}\\s]+$", "");
        return title.length() > MAX_TITLE_CHARS ? title.substring(0, MAX_TITLE_CHARS).trim() : title;
    }

    private boolean isGenericTitle(String title) {
        String normalized = title.toLowerCase(Locale.ROOT).replaceAll("[^\\p{L}\\p{N}]+", " ").trim();
        return normalized.isBlank()
                || normalized.equals("jd")
                || normalized.equals("job description")
                || normalized.equals("user provided jd")
                || normalized.equals("user provided job description");
    }
}
