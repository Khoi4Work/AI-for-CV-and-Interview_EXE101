package fpt.su26.exe101.backend.modules.cv.entity.enums;

import java.util.List;
import java.util.regex.Pattern;
import java.util.stream.Stream;

/** Canonical IT job roles and their normalized English/Vietnamese aliases. */
public enum JobRole {
    BUSINESS_ANALYST("BA", "business analyst", "business analysis", "phan tich nghiep vu", "ba"),
    DATA_ANALYST("DATA_ANALYST", "data analyst", "phan tich du lieu"),
    BACKEND("BACKEND", "backend", "back end", "back-end", "java developer", "spring developer"),
    FRONTEND("FRONTEND", "frontend", "front end", "front-end", "react developer"),
    FULLSTACK("FULLSTACK", "fullstack", "full stack", "full-stack"),
    QUALITY_ASSURANCE("QA", "qa", "qc", "tester", "quality assurance", "kiem thu"),
    DEVOPS("DEVOPS", "devops", "system engineer", "quan tri he thong"),
    DATA_ENGINEER("DATA_ENGINEER", "data engineer"),
    AI_ENGINEER("AI_ENGINEER", "machine learning", "ai engineer"),
    MOBILE("MOBILE", "mobile developer", "android developer", "ios developer"),
    SOFTWARE_ENGINEER("SOFTWARE_ENGINEER", "software engineer", "software developer", "lap trinh vien");

    private final String code;
    private final List<Pattern> aliases;

    JobRole(String code, String... aliases) {
        this.code = code;
        this.aliases = Stream.of(aliases)
                .map(alias -> Pattern.compile("(?<![\\p{L}\\p{N}])" + Pattern.quote(alias)
                        + "(?![\\p{L}\\p{N}])"))
                .toList();
    }

    public String code() {
        return code;
    }

    public boolean matches(String normalizedText) {
        return aliases.stream().anyMatch(alias -> alias.matcher(normalizedText).find());
    }
}
