# Design Spec: CV Evaluation Feature

**Date**: 2026-06-18
**Status**: Historical — superseded for new work by [CV–JD evaluation, scoring, and evidence spec (2026-10-09)](2026-10-09-cv-evaluation-trust-and-evidence-design.md).
**Goal**: Implement a professional CV evaluation flow that allows users to upload a CV and provide a Job Description (JD) to receive an AI-driven compatibility analysis.

> The original mock flow, simulated progress, URL scanning, and former relevance-score presentation below describe earlier design history. They are not requirements to restore. Follow the current spec linked above for implementation; selecting a JD never displays an evaluation score, and evaluation starts only after the user presses “Bắt đầu đánh giá”.

## 🎯 User Experience Flow
The feature follows a linear path to simulate a high-end AI analysis process:
`Header` $\rightarrow$ `CVEvaluation Page` $\rightarrow$ `CVAnalyzing Page` $\rightarrow$ `CVOptimizer Page`

### 1. Entry Point (Header)
- Add "Đánh giá CV" to the main navigation in `Header.jsx`.
- Use a relevant icon (e.g., `BrainCircuit` or `FileSearch` from `lucide-react`).
- Ensure alignment with "Template" and "Interview" items.

### 2. Input Page (`CVEvaluation.jsx`)
A focused portal for data collection.
- **Layout**: Two-column grid on desktop, single column on mobile.
- **Left Column (CV Upload)**:
    - A large drag-and-drop area.
    - Support for PDF and Word formats.
    - Visual feedback: Show filename and file type icon upon selection.
- **Right Column (JD Input)**:
    - Tab-based input:
        - **Tab 1: Text**: Large textarea for pasting JD content.
        - **Tab 2: URL**: Input field for LinkedIn/TopCV links with a "Scan" button.
- **Action**: A prominent "Bắt đầu đánh giá" button at the bottom.
- **Styling**: 
    - Primary Color: `#0b3c8f`.
    - Corners: `rounded-2xl`.
    - Shadows: Subtle, professional shadows.

### 3. Simulation Page (`CVAnalyzing.jsx`)
A transition page to build anticipation and simulate AI processing.
- **Visuals**: Central loading animation (spinner/pulse) with a clean background.
- **AI Mock Sequence**: A sequence of status messages that cycle every 800ms-1s:
    1. "Đang quét cấu trúc CV..." (Scanning CV structure...)
    2. "Đang trích xuất kỹ năng cốt lõi..." (Extracting core competencies...)
    3. "Đang phân tích mô tả công việc..." (Analyzing Job Description...)
    4. "Đang tính toán điểm tương thích..." (Calculating match score...)
    5. "Đang tạo gợi ý cải thiện..." (Generating improvement suggestions...)
- **Logic**: After the sequence completes (approx. 4-5 seconds), automatically redirect to `/cv-optimizer`.

### 4. Result Page (`CVOptimizer.jsx`)
- (Existing page) Display the final results, match score, and suggestions.

## 🛠 Technical Specifications

### File Changes
| File | Action | Purpose |
| :--- | :--- | :--- |
| `frontend/src/pages/cv-template/CVEvaluation.jsx` | Create | Main input interface |
| `frontend/src/pages/cv-template/CVAnalyzing.jsx` | Create | AI simulation page |
| `frontend/src/App.jsx` | Modify | Define routes for the new pages |
| `frontend/src/components/user/Header.jsx` | Modify | Add navigation link |
| `frontend/src/index.css` | Modify | Add animation keyframes for the analyzing page |

### State Management (Mock)
- Use a simple `setTimeout` or `useEffect` loop in `CVAnalyzing.jsx` to manage the status message sequence.
- Use `react-router-dom`'s `useNavigate` for the transition to `CVOptimizer`.

## 🎨 Design System Alignment
- **Primary Color**: `#0b3c8f`
- **Border Radius**: `rounded-2xl`
- **Typography**: Match existing project fonts and sizes.
- **Consistency**: Follow the clean, professional aesthetic defined in `index.css`.

---

## UX Revision Plan — 2026-10-08

### Product decisions

1. **CV entry stays non-blocking.** Keep upload as the primary entry on the evaluation page. Do not show a separate “Chưa có CV?” notice or interrupt every user with a mandatory modal. CV creation remains reachable from the existing CV creation flow, which returns users to evaluation when that route is preserved.
2. **Validate uploads immediately.** Accept PDF, DOC, and DOCX up to 5 MB. Show a clear inline error as soon as a selected or dropped file is invalid; do not silently ignore a rejected drop.
3. **Search before asking the user to choose.** After CV import, if `professionalTitle` identifies an application role, immediately rank available JDs against the role using the complete JD document, including `content`; do not depend on the database `title`, which may be a generic placeholder such as “User Provided JD”. Return up to two JDs and normalize common equivalent role names such as BA, Business Analyst, and Phân tích nghiệp vụ. Do not ask the user to type or confirm a role before searching. If the CV has no explicit role, rank available JDs using its skills, experience, summary, and projects; explain that these suggestions are inferred from the CV and let the user choose a JD. Do not use the last employment role as an assumed target role.
4. **Make JD selection inspectable.** Keep the recommended JD title and metadata on its card. Provide a full-content preview and an explicit “Chọn JD này” action. Previewing a JD must not silently select it or fill the custom JD editor. Keep pasting a private JD as a separate, optional path.
5. **Make progress truthful.** Loading labels and progress must correspond to extraction, JD lookup, CV evaluation, skill-gap analysis, and feedback generation. Avoid claiming a numeric completion percentage for work whose progress is not measurable.
6. **Keep score semantics distinct.** JD search/re-ranking is “liên quan”; a score produced after running the CV evaluation rubric is “điểm đánh giá độ phù hợp CV–JD”. Do not expose the retrieval/re-ranking score as an evaluation score.
7. **Alternative-role recommendations.** Evaluate alternative-role JDs with the same CV evaluation operation and current plan as the active JD. Return at most two JDs whose CV evaluation score is strictly higher than the active JD. The UI may omit those comparison numbers, but must identify them as higher evaluation scores.

### Acceptance criteria

- Users can choose upload or CV creation without a blocking modal; upload validation gives immediate, actionable feedback.
- The user can search JDs directly from the uploaded CV without entering a target role. When `professionalTitle` exists, the system ranks full JD text against that role even when the DB title is generic; when no title exists, it ranks from CV skills and experience and explains the inferred basis before the user selects a JD.
- Users can preview the entire recommended JD before explicitly selecting it; custom JD text remains an independent option. Alternative-role cards also expose the full JD and can start another evaluation with the already imported CV.
- Evaluation progress does not imply false completion, and the result labels distinguish CV–JD evaluation from JD relevance.
- The result screen keeps the full recommended JD content accessible and alternative roles appear after the main result, with no more than two suggestions that scored strictly higher under the same evaluation rubric.

### User-provided JD titles and removal — 2026-10-09

- Extract a concise role title from the full JD content when a user-provided JD is first saved. Preserve a specific title supplied by the user; replace generic placeholders such as “User provided JD” with the extracted title. Fall back to a clearly generic “JD chưa có tiêu đề” when extraction cannot determine a role.
- Backfill legacy generic titles when the user opens their saved JD library, and persist the result so extraction is not repeated on later visits.
- Provide a “JD của tôi” page showing saved user JDs by title, company, and content, with an explicit hide action.
- Let users edit the JD title, company, and full content; update the normalized content hash and reject duplicate content within the same gallery.
- When saved JD content is structured JSON, present a readable text version in the editor and fill missing title/company metadata from the JSON instead of exposing raw serialized data.
- Hide a JD by setting its existing `active` flag to false. Exclude inactive user JDs from the saved list and new recommendations while retaining the row for historical evaluations and interview sessions that reference it. Re-submitting the same JD content intentionally restores the saved entry.
- Label user-provided JDs as unverified; title extraction identifies the role but does not verify the job posting’s authenticity.
