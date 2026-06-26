# Interview Flow — Implementation Plan (Inline Execution)

**Goal:** High-fidelity prototype cho 10 bước interview (setup → room → review → result) với mock data, mic thật, state machine, auto-end rule, feedback có tag.

**Architecture:**
- Data layer: `/src/constant/` chứa mock data (FPT-only, IT).
- Session layer: `sessionStorage` key `interview_session_v1` qua hook `useInterviewSession()`.
- Pages: rewrite 10 file trong `/src/pages/interview/` để đọc/ghi session, có progress bar 1/10 → 10/10, có guard redirect.

**Tech Stack:** React 19, react-router-dom, lucide-react, Tailwind v4, Web Audio API (`getUserMedia` + `AnalyserNode`).

---

## Tasks (theo thứ tự thực hiện)

### Task 1: Tạo `/src/constant/` với 7 file mock data
- `jobs.js`, `companies.js`, `experienceLevels.js`, `interviewTypes.js`, `questionBank.js`, `feedbackInterviewRubric.js`, `stepDefinitions.js`
- FPT-only company, IT-focused questions, dùng `docs/FPT/*.csv` làm nguồn cho Technical questions.

### Task 2: Tạo hook `useInterviewSession()`
- `src/hooks/useInterviewSession.js` — read/write `sessionStorage`, cung cấp `data, update(patch), reset(), generateQuestions(), generateFeedback()`.

### Task 3: Sửa 7 trang setup (steps 1-7) để lưu session + progress 1/10
- JobSelection, CVStatus, ExperienceLevel, CareerGoal, InterviewSetup, AudioSetup, VideoSetup.
- Sửa InterviewSetup để có select Company (FPT cố định), JD textarea, fix nút Back đang trỏ nhầm.

### Task 4: Sửa `AppLayout.jsx` — thêm guard cho room/result
- Guard `/interview/room` cần `session.questions` (redirect về step 1 nếu thiếu).
- Guard `/interview/result` cần `session.feedback` (redirect về step 1 nếu thiếu).

### Task 5: Viết lại `InterviewRoom.jsx` — state machine + voice activity
- 5 states: idle, asking (2.5s typing, ẩn câu hỏi), recording (hiện câu + mic thật + VAD), processing (1.2s), between (5s).
- Mic thật: `getUserMedia` + `AnalyserNode`, threshold 12.
- Cụm kết: regex `(xin hết|hết rồi|xong rồi|hết câu|that'?s it|i'?m done)`.
- 10s im lặng trong câu → skip; 5s im lặng giữa câu → skip; 2 skip liên tiếp → auto-end.
- KHÔNG có side panel, KHÔNG có suggestion box, KHÔNG có nút End.

### Task 6: Sửa `VideoReview.jsx` — fix back link + progress 9/10

### Task 7: Viết lại `InterviewResult.jsx` — render từ session
- 2 cột: HR persona + scores (trái), transcript + suggestions (phải).
- 5 tiêu chí, tag must-have/nice-to-have, HR persona FPT.

### Task 8: Self-verify (theo section 12 của spec)
- Click qua 10 bước, test mic, test skip flow, test guard.

---

## Files changed

**Tạo mới (9 files):**
- `src/constant/jobs.js`
- `src/constant/companies.js`
- `src/constant/experienceLevels.js`
- `src/constant/interviewTypes.js`
- `src/constant/questionBank.js`
- `src/constant/feedbackInterviewRubric.js`
- `src/constant/stepDefinitions.js`
- `src/hooks/useInterviewSession.js`
- `docs/superpowers/plans/2026-06-16-interview-flow.md` (this file)

**Sửa (10 files):**
- `src/components/layout/AppLayout.jsx`
- `src/pages/interview/JobSelection.jsx`
- `src/pages/interview/CVStatus.jsx`
- `src/pages/interview/ExperienceLevel.jsx`
- `src/pages/interview/CareerGoal.jsx`
- `src/pages/interview/InterviewSetup.jsx`
- `src/pages/interview/AudioSetup.jsx`
- `src/pages/interview/VideoSetup.jsx`
- `src/pages/interview/InterviewRoom.jsx`
- `src/pages/interview/VideoReview.jsx`
- `src/pages/interview/InterviewResult.jsx`
