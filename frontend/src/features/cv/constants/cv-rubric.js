/**
 * CV Evaluation Rubric based on MIT (CAPD) Standards
 *
 * This rubric is used to assess the quality of a CV and its alignment with a Job Description (JD).
 * It focuses on quantification, impact, and professional presentation.
 */

export const CV_RUBRIC = {
    QUANTIFICATION: {
        excellent: "Every bullet point contains a quantifiable metric (%, $, numbers, scale) and describes a specific achievement.",
        good: "Most bullet points contain metrics, but some are still descriptive of tasks.",
        poor: "Few or no metrics used. Focuses on responsibilities rather than achievements."
    },
    ACTION_VERBS: {
        excellent: "Starts every bullet point with a strong, specific action verb (e.g., 'Architected', 'Slashed', 'Engineered').",
        good: "Uses action verbs, but some are generic (e.g., 'Managed', 'Developed').",
        poor: "Uses passive or vague phrasing (e.g., 'Responsible for', 'Helped with', 'Worked on')."
    },
    STRUCTURE: {
        excellent: "Perfectly organized sections (Education, Experience, Leadership, Skills) with a clear, logical flow.",
        good: "Standard organization, though some sections could be better grouped.",
        poor: "Disorganized, missing key sections, or contains irrelevant information."
    },
    PROFESSIONALISM: {
        excellent: "Concise, no 'fluff' or clichéd adjectives. Focused on evidence and professional achievements.",
        good: "Professional tone, but contains a few generic statements.",
        poor: "Contains 'fluff' (e.g., 'hard-working', 'team player' without proof), unprofessional contact info, or vague summaries."
    },
    JD_ALIGNMENT: {
        excellent: "High overlap between CV skills and JD requirements. Clearly demonstrates the ability to solve the specific problems mentioned in the JD.",
        good: "Possesses most required skills, but the connection to the JD's specific needs is not fully highlighted.",
        poor: "Significant gap in core skills. CV does not address the key requirements of the JD."
    }
};
