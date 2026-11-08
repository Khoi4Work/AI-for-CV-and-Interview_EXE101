# Interview Feedback Personalization Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Return evidence-grounded priorities and more natural, actionable interview feedback, with an optional per-session feedback voice that never changes evaluation standards.

**Architecture:** The frontend sends an allowlisted feedback voice during interview setup. The backend stores it in the existing JSON session context, adds it to the evaluation transcript, and asks the model for conversational feedback plus an explicit suggestion-priority enum. The frontend renders that returned priority and removes its current hardcoded `must-have` assignment.

**Tech Stack:** React/Vite, Node's built-in test runner, Java 21, Spring Boot, JUnit 5, Mockito, Jackson.

**Spec:** `.spec/interview-feedback-personalization-spec.md`

## Global Constraints

- Default missing or invalid feedback style to `SUPPORTIVE`.
- Allow only `SUPPORTIVE`, `DIRECT`, and `COACHING` styles; the style changes wording and coaching detail only.
- Use `FOCUS_FIRST`, `NEXT_STEP`, or null for suggestion priority; do not derive priority from score alone.
- Ground evaluation and priorities in the supplied question, grading criteria, interview type, experience level, and answer.
- Do not infer personality or culture from personal profiles, CV details, accent, or web scraping.
- Preserve score calculation, rubric, plan entitlements, and all old saved evaluations; tolerate saved feedback without a priority field.
- Persist feedback style in the existing session context snapshot; no database migration is needed.

## Review Focus

- A skipped or unanswered item has no personalized suggestion or priority, while the rest of the evaluation remains available.
- Old saved evaluations without `suggestionPriority` still render without an invented badge.
- Missing or invalid `feedbackStyle` uses `SUPPORTIVE`, including for sessions created before this feature.
- An unclear rubric point cannot become `FOCUS_FIRST` solely because of a low score.
- Changing voice style does not change score, rubric result, priority, or factual claims.

---

### Task 1: Carry feedback voice from setup into the saved session

**Files:**
- Create: `backend/src/main/java/fpt/su26/exe101/backend/modules/interview/entity/enums/InterviewFeedbackStyle.java`
- Modify: `backend/src/main/java/fpt/su26/exe101/backend/modules/interview/dto/request/CreateInterviewSessionRequestDTO.java`
- Modify: `backend/src/main/java/fpt/su26/exe101/backend/modules/interview/service/impl/InterviewServiceImpl.java`
- Modify: `frontend/src/features/interview/pages/InterviewSetup.jsx`
- Modify: `frontend/src/features/interview/services/interviewConfiguration.js`
- Test: `backend/tests/java/fpt/su26/exe101/backend/modules/interview/service/impl/InterviewConfigurationTest.java`
- Test: `frontend/tests/interviewConfiguration.test.js`

**Interfaces:**
- Request field: `feedbackStyle` as a string accepted from the client and normalized by the backend to `SUPPORTIVE`, `DIRECT`, or `COACHING`.
- Store the normalized enum name in `InterviewSession.contextSnapshot.feedbackStyle`.
- `interviewPayload(data)` sends the selected style and defaults to `SUPPORTIVE`; `interviewFingerprint(data)` includes it so a changed setup choice cannot reuse a session created with another style.

- [ ] **Step 1: Add failing backend and frontend configuration tests**

Assert that setup requests retain each allowed style, absent/invalid styles normalize to `SUPPORTIVE`, and a created session snapshot contains the normalized style. Assert that the frontend payload defaults to `SUPPORTIVE` and its fingerprint changes when the style changes.

- [ ] **Step 2: Add the setup choice and persist the normalized style**

Add the three style options to `InterviewSetup.jsx`, retain the selection in the setup draft/config, pass it through `interviewConfiguration.js`, normalize it in the backend, and store it in the session snapshot without adding a database column.

- [ ] **Step 3: Run focused configuration tests**

Run from `backend`: `./mvnw.cmd -Dtest=InterviewConfigurationTest test`
Expected: PASS, including selected, missing, and invalid style cases.

Run from `frontend`: `npm test -- tests/interviewConfiguration.test.js`
Expected: PASS, including default, payload, and fingerprint assertions.

### Task 2: Generate conversational feedback with a rubric-grounded priority

**Files:**
- Create: `backend/src/main/java/fpt/su26/exe101/backend/modules/interview/entity/enums/InterviewSuggestionPriority.java`
- Modify: `backend/src/main/java/fpt/su26/exe101/backend/modules/interview/dto/response/InterviewEvaluationResponseDTO.java`
- Modify: `backend/src/main/java/fpt/su26/exe101/backend/modules/interview/service/impl/InterviewServiceImpl.java`
- Modify: `backend/src/main/java/fpt/su26/exe101/backend/modules/interview/service/impl/InterviewAIProviderImpl.java`
- Modify: `backend/src/main/java/fpt/su26/exe101/backend/base/persistence/Prompt.java`
- Create: `backend/tests/java/fpt/su26/exe101/backend/modules/interview/service/impl/InterviewAIProviderImplTest.java`

**Interfaces:**
- Add `QuestionFeedback.suggestionPriority` with enum values `FOCUS_FIRST` and `NEXT_STEP`; allow null.
- Evaluation transcript includes the normalized `feedbackStyle` from the session snapshot.
- `Prompt.interviewEvaluation` uses that style and requires grounded `assessment`, `improvementSuggestion`, and priority output in its plan-specific JSON schema.

- [ ] **Step 1: Add failing provider tests for priority and skipped answers**

Cover valid enum parsing, the generated prompt receiving the selected feedback style, skipped/unanswered feedback being normalized to neutral assessment with empty suggestion and null priority, invalid model priority being rejected rather than displayed as a trusted label, and prompt instructions that keep score/priority independent of voice style and score thresholds alone.

- [ ] **Step 2: Add the response enum and normalize skipped/unanswered feedback**

Add `InterviewSuggestionPriority`, include it in `QuestionFeedback`, add the saved session style to the transcript in `InterviewServiceImpl`, and clear suggestion/priority for skipped or unanswered questions in `InterviewAIProviderImpl`.

- [ ] **Step 3: Update the evaluation prompt and schema**

Require natural Vietnamese tied to answer evidence; for vague answers, include two or three small recall questions and a fill-in scaffold; prohibit invented candidate facts. Define `FOCUS_FIRST` only for a clear material rubric gap or materially incorrect answer, use `NEXT_STEP` when centrality is unclear, and never use score alone to assign priority. Apply voice style to narrative text only.

- [ ] **Step 4: Run focused backend tests**

Run from `backend`: `./mvnw.cmd -Dtest=InterviewAIProviderImplTest,InterviewConfigurationTest,InterviewFreeFeedbackTest test`
Expected: PASS, including old plan-tier behavior and the new output contract.

### Task 3: Render backend priorities and remove hardcoded tags

**Files:**
- Modify: `frontend/src/features/interview/hooks/useInterviewSession.js`
- Modify: `frontend/src/features/interview/pages/InterviewResult.jsx`
- Modify: `frontend/src/features/interview/constants/feedbackInterviewRubric.js`
- Modify: `frontend/src/features/interview/services/interviewExports.js`
- Create: `frontend/tests/interviewFeedbackPresentation.test.js`

**Interfaces:**
- Map backend `suggestionPriority` to the presentation layer without converting every non-empty suggestion to `must-have`.
- Render `FOCUS_FIRST` as “Ưu tiên luyện trước” and `NEXT_STEP` as “Có thể cải thiện thêm”; render no priority badge for null or unknown values.
- Keep skipped/unanswered items as a neutral assessment/status with no improvement card.

- [ ] **Step 1: Add failing presentation mapping tests**

Test both returned priority values, null/unknown priority, empty suggestion, skipped answer, and legacy saved evaluation without the new field. Assert that no path produces the old `Must-have` badge by default.

- [ ] **Step 2: Map the response enum and update result/export rendering**

Update `toFeedback` to preserve the backend priority, remove the hardcoded `must-have` tag and unused tag fallback, render localized priority labels in the result card and transcript export, and keep neutral skipped feedback free of suggestion cards.

- [ ] **Step 3: Run focused frontend checks**

Run from `frontend`: `npm test -- tests/interviewFeedbackPresentation.test.js tests/interviewConfiguration.test.js`
Expected: PASS.

Run from `frontend`: `npm run build`
Expected: successful production build with the updated result and setup flows.

## Handoff

This plan is for a later implementation pass. Do not begin code changes until the user requests implementation and reviews this plan.
