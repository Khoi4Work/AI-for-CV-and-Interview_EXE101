package fpt.su26.exe101.backend.base.persistence;

import lombok.AccessLevel;
import lombok.NoArgsConstructor;

/**
 * Central repository for AI prompt templates used throughout the application.
 */
@NoArgsConstructor(access = AccessLevel.PRIVATE)
public class Prompt {
    private static final String CV_IMPORT_INSTRUCTIONS = "First determine whether the text is a person's CV/resume. "
            + "Do not treat job descriptions, cover letters, certificates, articles, or other documents as a CV. "
            + "Return only valid JSON, with no markdown, in this wrapper shape: "
            + "{isCV:boolean, extractedData:{personalInfo:{name,email,phone,dob,address,linkedin}, "
            + "summary:string, experiences:[{company,role,period,details:[string]}], "
            + "education:[{degree,school,year,gpa}], skills:[string], "
            + "projects:[{name,period,details:[string],url}], "
            + "certificates:[{name,issuer,date,url}], languages:[{name,level}], "
            + "awards:[{name,issuer,date}]}}. Set isCV false for non-CV documents. "
            + "Use empty strings or arrays for missing values; "
            + "do not invent information.\n\nCV text:\n";

    public static String cvImport(String extractedText) {
        return CV_IMPORT_INSTRUCTIONS + extractedText;
    }

    public static String cvEvaluation(String cvContent, String jdText) {
        return "Evaluate CV " + cvContent + " against job description " + jdText
                + ". Return JSON only with schema {score: integer 0-100, atsCompatibility: integer 0-100, "
                + "analysis: {strengths: string[], weaknesses: string[], suggestions: string[]}}.";
    }

    public static String cvFeedback(String cvContent, String jdText) {
        return "Provide SWOT and section-by-section feedback for CV " + cvContent + " vs JD " + jdText
                + ". Return JSON only with schema {overallScore: integer, feedback: {swot: object, sectionAnalysis: object}}.";
    }

    public static String cvSkillGap(String cvContent, String jdText) {
        return "Identify skills matching and missing between CV " + cvContent + " and JD " + jdText
                + ". Return JSON only with schema {matchingSkills: string[], missingSkills: string[]}.";
    }
}
