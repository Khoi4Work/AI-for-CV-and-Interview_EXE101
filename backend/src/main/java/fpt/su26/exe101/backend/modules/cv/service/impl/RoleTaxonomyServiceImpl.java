package fpt.su26.exe101.backend.modules.cv.service.impl;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import fpt.su26.exe101.backend.modules.cv.entity.enums.JobRole;
import fpt.su26.exe101.backend.modules.cv.service.RoleTaxonomyService;
import java.text.Normalizer;
import java.util.Locale;
import java.util.Objects;
import java.util.Set;
import java.util.TreeSet;
import java.util.regex.Pattern;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

/**
 * Deterministic role matching for occupation filters. Aliases are curated in {@link JobRole}
 * so filtering does not vary between model calls or rely on generated guesses.
 */
@Service
@RequiredArgsConstructor
public class RoleTaxonomyServiceImpl implements RoleTaxonomyService {
    private static final Pattern COLLABORATION_CONTEXT = Pattern.compile(
            "collaborat|coordinate|phoi hop|lam viec voi|work with");
    private static final Pattern ROLE_HEADING = Pattern.compile(
            "vi tri|position|job title|tuyen dung|chuc danh|role:|recruit|we are hiring");

    private final ObjectMapper objectMapper;

    @Override
    public Set<String> roles(String value) {
        String normalizedValue = normalize(value);
        Set<String> matchedRoles = new TreeSet<>();
        for (JobRole role : JobRole.values()) {
            if (role.matches(normalizedValue)) {
                matchedRoles.add(role.code());
            }
        }
        return matchedRoles;
    }

    @Override
    public Set<String> jobRoles(String title, String content) {
        // A role mentioned only in a collaboration sentence is not a recruiting role.
        Set<String> matchedRoles = new TreeSet<>(roles(title));
        if (content == null) {
            return matchedRoles;
        }

        try {
            JsonNode jobDescription = objectMapper.readTree(content);
            if (jobDescription != null && jobDescription.isObject()) {
                matchedRoles.addAll(roles(jobDescription.path("title").asText()));
                if (!matchedRoles.isEmpty()) {
                    return matchedRoles;
                }
            }
        } catch (JsonProcessingException ignored) {
            // User-provided legacy JDs may contain plain text rather than JSON.
        }

        int lineNumber = 0;
        for (String line : content.split("[\\r\\n]+")) {
            if (line.isBlank()) {
                continue;
            }
            lineNumber++;
            String normalizedLine = normalize(line);
            if (COLLABORATION_CONTEXT.matcher(normalizedLine).find()) {
                continue;
            }
            if (ROLE_HEADING.matcher(normalizedLine).find()) {
                matchedRoles.addAll(roles(line));
            } else if (lineNumber == 1 && !line.stripLeading().startsWith("{")
                    && line.trim().split("\\s+").length <= 6) {
                matchedRoles.addAll(roles(line));
            }
        }
        return matchedRoles;
    }

    private String normalize(String value) {
        return Normalizer.normalize(Objects.toString(value, "").toLowerCase(Locale.ROOT), Normalizer.Form.NFD)
                .replaceAll("\\p{M}", "")
                .replace('đ', 'd');
    }
}
