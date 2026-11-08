package fpt.su26.exe101.backend.modules.interview.entity.enums;

public enum InterviewFeedbackStyle {
    SUPPORTIVE,
    DIRECT,
    COACHING;

    public static InterviewFeedbackStyle from(String value) {
        if (value == null || value.isBlank()) return SUPPORTIVE;
        try {
            return valueOf(value.trim().toUpperCase(java.util.Locale.ROOT));
        } catch (IllegalArgumentException exception) {
            return SUPPORTIVE;
        }
    }
}
