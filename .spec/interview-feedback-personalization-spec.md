# Interview feedback: evidence-based priorities and adjustable voice

**Status:** Approved design for implementation planning. Code changes were not part of this request.

## Intent

Make mock-interview feedback feel like a thoughtful coach: specific to the candidate's answer, kind without being falsely reassuring, and useful enough to help them form a better answer. Give each improvement a meaningful priority based on the question's evaluation criteria and answer evidence. Let users choose how feedback is phrased without changing the evaluation standard.

## Current behavior

- `Prompt.interviewEvaluation` requests a concise assessment and one practical improvement suggestion per question. Its style rules enforce Vietnamese and plain text, but do not ask for a conversational voice, small guiding questions, a response outline, or a worked example.
- The evaluation transcript sent to the AI includes interview type, experience level, question text, category, competency, grading criteria, answer, and skipped/unanswered state. It does not include external web research or the user's full CV/JD.
- `InterviewEvaluationResponseDTO.QuestionFeedback` has `questionId`, `score`, `assessment`, and `improvementSuggestion`; it has no priority/tag field.
- The frontend currently assigns `must-have` to every non-empty suggestion and renders that fixed tag. This label does not come from the model or backend.
- Feedback for a completed session is persisted and returned as saved JSON. A prompt change therefore affects new evaluations, not already saved feedback.

## Proposed behavior

### 1. Assign a useful priority to each improvement

Replace the misleading `must-have` tag with a server-returned enum such as:

- `FOCUS_FIRST`: a material gap against an important point in the question's grading criteria, or a materially incorrect answer. In user-facing Vietnamese, render as **Ưu tiên luyện trước**.
- `NEXT_STEP`: the answer is broadly relevant/correct, and the suggestion would improve its specificity, structure, or depth. Render as **Có thể cải thiện thêm**.
- `null`: no improvement card is appropriate, including a skipped/unanswered question. Do not imply the candidate failed to meet a requirement when there is no answer evidence.

Priority must be assigned by comparing the answer with the question, its competency, grading criteria, interview type, and experience level. The AI may infer that a grading point is central only when that is clear from the question and supplied criteria; if centrality is unclear, use `NEXT_STEP` rather than inventing a core requirement. The score can be a consistency signal, but must not be the sole formula: a numeric threshold cannot explain which evidence is missing and may mislabel a nuanced response.

Do not call feedback priority a job requirement or a universal “must-have.” Only use `FOCUS_FIRST` when the answer has a specific, material gap under the supplied rubric. If the rubric is broad or incomplete, prefer `NEXT_STEP` and state the uncertainty in plain language rather than inventing a hard requirement.

### 2. Make assessment and suggestions conversational and actionable

Apply the selected voice to summary, strengths, improvement areas, criterion feedback, per-question assessments, and suggestions. Preserve evidence-based scoring and factual boundaries.

For each answered question:

1. Refer to something the candidate actually said, or plainly say what evidence is missing.
2. Explain one main strength or gap in natural Vietnamese, without judging personality or making unsupported claims about ability.
3. When the answer is vague or the candidate says they do not know, acknowledge the difficulty without blame and offer two or three small recall questions tied to the question (for example: which project/task, what part they personally did, what changed or what they learned).
4. Give a short answer scaffold with fill-in prompts. Add an example only when it can be grounded in the candidate's supplied answer; otherwise use bracketed placeholders and tell the candidate to fill them with true details.
5. Keep suggestions concise and focused on the next attempt. Do not tell the candidate to “be specific” without showing what details to recall or how to organize them.

For skipped/unanswered questions, show the neutral assessment/status that no answer evidence was available. Do not show an improvement card or priority badge. Do not infer poor ability, confidence, motivation, or character from absent evidence.

### 3. Offer explicit voice preferences

Keep the normal flow usable without configuration. The recommended default is `SUPPORTIVE`: natural, respectful, encouraging without empty praise, and focused on one next step. This is a better default experience than preserving the current mechanical phrasing; users should not have to choose a style to receive human-sounding feedback.

Let a user choose a session-level feedback voice from an allowlisted set:

- `SUPPORTIVE`: warm and encouraging.
- `DIRECT`: concise and candid, without harsh or shaming language.
- `COACHING`: more guided, with short questions and prompts to help the candidate recall examples.

The user chooses the voice in interview setup before starting the session. Persist the selected enum with the session configuration so the later evaluation uses the choice without asking the user to regenerate feedback. It changes wording and amount of coaching only; it must not change scores, rubric interpretation, priority classification, or factual standards. Default to `SUPPORTIVE` when the preference is missing or invalid. Do not accept arbitrary free-form prompt instructions as a voice setting. For the first version, keep the choice per interview session; saving an account-wide preference can be considered later.

Do not infer voice, personality, demographic traits, or cultural background from a CV, name, accent, online profiles, or scraped web data. Localization can adjust language and explicit forms of address, but should not assume the user's identity.

## Alternatives for determining a suggestion's priority

These alternatives compare how the system decides whether an improvement is a material gap to focus on first or a useful next step. They are not alternatives for the feedback voice.

| Approach | Benefits | Costs and risks | Recommendation |
| --- | --- | --- | --- |
| AI classifies priority from the supplied rubric and answer | Uses the actual question and evidence; can distinguish a major gap from optional polish | May vary between model responses; requires concrete prompt rules and examples | **Chosen for the first version**, with a small enum and evaluation checks |
| Backend derives priority from score thresholds | Consistent and easy to validate | Score alone loses the reason for the gap; thresholds can create misleading labels | Do not use as the primary method; use score only as a consistency check |
| Mark essential grading points in question metadata, then derive priority from coverage | Most auditable and consistent when rubrics are complete | Requires richer question-bank data and curation; existing questions may lack reliable metadata | Consider if the question bank adopts explicit essential/optional key points |
| Hybrid: AI identifies the missing evidence and backend maps it through explicit criterion importance metadata | Keeps the AI grounded in the answer while making priority more consistent and auditable | Requires explicit importance metadata and reliable rubrics for the question bank | Future option if rubric metadata is improved |

For feedback voice personalization, use the explicit user-selected style described above. Inferring a user's personality or culture from profiles, CV details, accent, or scraped sources is excluded.

## Data contract and interface implications

- Add an optional allowlisted `feedbackStyle` to interview setup/session creation and persist it with the session configuration. The evaluator reads it from the stored session and defaults to `SUPPORTIVE` for old or missing values.
- Add `suggestionPriority` (`FOCUS_FIRST`, `NEXT_STEP`, nullable) to each question feedback response. The AI returns the enum under the prompt's rules; the backend validates it against the allowed set.
- Frontend renders labels and visual emphasis from the returned enum. It must not infer a priority merely because `improvementSuggestion` is non-empty. Unknown/missing values render without a priority badge.
- Keep plan entitlement behavior and existing score calculations unchanged. All entitled users retain the current feedback fields; style selection does not unlock additional evaluation fields.
- Old persisted evaluations without `suggestionPriority` remain readable and display without the old hardcoded badge. Re-evaluation of saved sessions is outside this change.

## Acceptance examples

- Answer: “Tôi không biết, xin hết.” The feedback acknowledges that the question may be hard to start, says there is not enough example evidence to assess this answer, asks a few short recall questions, and provides a fill-in scaffold. It does not say the candidate has no ability and does not invent a project or result.
- Vague project answer. The feedback identifies which rubric point is missing and asks for the candidate's own role/action/outcome instead of repeating “give a specific example.”
- Strong answer with a minor opportunity to improve structure. It receives `NEXT_STEP`, not `FOCUS_FIRST`, even if the score is not perfect.
- Skipped question. The feedback states that there is no answer to assess; no personalized priority badge is assigned.
- Changing `feedbackStyle` changes phrasing only. For the same transcript, the evaluation criteria and intended priority remain stable.

## Out of scope

- Changing interview question generation, scoring weights, overall score calculation, or plan entitlements.
- Using online research, profile scraping, or inferred demographic/cultural traits to personalize feedback.
- Changing the interviewer's spoken voice or persona; this spec concerns written evaluation feedback.
- Automatically regenerating feedback already saved for completed sessions.

## Implementation details left to the builder

The implementer may choose the exact prompt wording, enum serialization details, the control's visual placement within interview setup, and regression-test structure, provided the behavior and data boundaries above are preserved.
