package fpt.su26.exe101.backend.base.persistence;

import lombok.AccessLevel;
import lombok.NoArgsConstructor;

/**
 * Central repository for AI prompt templates used throughout the application.
 */
@NoArgsConstructor(access = AccessLevel.PRIVATE)
public class Prompt {
    private static final String CV_IMPORT_INSTRUCTIONS = "Extract CV details from the text below. "
            + "Return only valid JSON, with no markdown. "
            + "Use this shape and camelCase keys: {personalInfo:{name,email,phone,dob,address,linkedin}, "
            + "summary:string, experiences:[{company,role,period,details:[string]}], "
            + "education:[{degree,school,year,gpa}], skills:[string], "
            + "projects:[{name,period,details:[string],url}], "
            + "certificates:[{name,issuer,date,url}], languages:[{name,level}], "
            + "awards:[{name,issuer,date}]}. Use empty strings or arrays for missing values; "
            + "do not invent information.\n\nCV text:\n";

    public static String cvImport(String extractedText) {
        return CV_IMPORT_INSTRUCTIONS + extractedText;
    }
}
