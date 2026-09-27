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
            + "education:[{degree,school,year,gpa}], skills:[{name,level,category}], "
            + "projects:[{name,period,details:[string],url}], "
            + "certificates:[{name,issuer,date,url}], languages:[{name,level}], "
            + "awards:[{name,issuer,date}]}}. Set isCV false for non-CV documents. "
            + "For skills, level must be exactly BEGINNER, INTERMEDIATE, ADVANCED, EXPERT, or null. "
            + "Only set a level if the CV explicitly states it; otherwise use null. Never infer skill level. "
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
                + ". Return JSON only with schema {overallScore: integer, feedback: {swot: "
                + "{strengths: string[], weaknesses: string[], opportunities: string[], threats: string[]}, "
                + "sectionAnalysis: [{sectionName: string, strengths: string[], weaknesses: string[], suggestions: string[]}]}}.";
    }

    public static String cvSkillGap(String cvContent, String jdText) {
        return "Identify skills matching and missing between CV " + cvContent + " and JD " + jdText
                + ". Return JSON only with schema {matchingSkills: string[], missingSkills: string[]}.";
    }

    public static String cvOptimization(String cvContent, String jdText) {
        return "Optimize the CV JSON " + cvContent + " for this job description: " + jdText
                + ". Preserve the CV schema and factual information. Return JSON only with schema "
                + "{optimizedContent: {personalInfo: object, summary: string, experiences: array, education: array, "
                + "skills: [{name: string, level: BEGINNER|INTERMEDIATE|ADVANCED|EXPERT|null, category: string|null}], "
                + "Only set level when the CV explicitly states a proficiency level; otherwise use null. "
                + "Do not infer or assign a level. Projects: array, certificates: array, "
                + "languages: array, awards: array}, improvementSummary: string, predictedScore: integer}.";
    }
}
