# Interview Flow — High-Fidelity Prototype Design

**Date**: 2026-06-16
**Status**: Draft (pending user approval)
**Author**: Claude (brainstorming session)
**Scope**: Frontend only — `frontend/src/`

## 1. Background & Goals

Trang interview hiện tại là bộ shell rỗng, mock data rải rác trong từng file, không có state chuyển tiếp giữa các bước. `InterviewRoom` chỉ hiển thị 1 câu cố định, không có timer/voice activity/state machine. `InterviewResult` hardcode 2 câu hỏi. Cần một lớp mock data + state layer để mô phỏng trải nghiệm thực tế của AI voice interview.

**Goals**
- Mô phỏng đúng luồng 10 bước: chọn job → CV → experience → goal → setup → audio test → video setup → room → review → result.
- `InterviewRoom` chạy state machine hỏi/đáp với voice activity thật (mic qua `getUserMedia` + `AnalyserNode`) và timer 10s/5s.
- `InterviewResult` sinh feedback từ session: 5 tiêu chí điểm + transcript với tag must-have/nice-to-have + HR persona FPT.
- Data mock lưu tập trung ở `/src/constant/`, state session lưu `sessionStorage`.

**Non-goals**
- Real AI integration, real speech-to-text, real feedback generation.
- Multi-company/multi-industry (chỉ FPT, IT).
- PDF export thật.
- I18n, accessibility đầy đủ.

## 2. Kiến trúc tổng quan

```
┌─────────────────────────────────────────────────────────────┐
│  AppLayout (router)                                         │
│  - Giữ nguyên cấu trúc route hiện tại                       │
│  - Guard: /interview/room cần session.questions              │
│  - Guard: /interview/result cần session.feedback            │
└──────────────────────┬──────────────────────────────────────┘
                       │
       ┌───────────────┼───────────────┐
       │               │               │
       ▼               ▼               ▼
   Constants       Session         Pages (10)
   /src/constant/  sessionStorage  /src/pages/interview/
   jobs.js         + hook
   companies.js    useInterviewSession()
   experienceLevels.js
   interviewTypes.js
   questionBank.js
   feedbackRubric.js
   stepDefinitions.js
```

**Data flow**:
- Setup pages (1-7) ghi vào `sessionStorage` qua `useInterviewSession().update()`.
- Khi vào `/interview/room`: hook sinh `questions[]` từ `questionBank` dựa trên `interviewConfig`, lưu vào session.
- Trong room: cập nhật `answers[]` real-time, navigate khi kết thúc.
- Khi vào `/interview/result`: hook sinh `feedback` từ `session.questions + answers + config`.

## 3. Session state shape

```js
// sessionStorage key: 'interview_session_v1'
{
  step: number,                     // 1..10, set khi user vào mỗi trang
  job: { id, title, industry } | null,
  cvStatus: 'have' | 'nothave' | null,
  experienceLevel: 'Intern' | 'Junior' | 'Senior' | 'Expert' | null,
  careerGoal: string,               // mặc định ''
  interviewConfig: {
    type: 'HR' | 'Technical' | 'Behavioral',
    language: 'vi' | 'en',
    duration: 5 | 10 | 15,          // phút
    company: { id, name, industry, culture } | null,  // luôn = FPT
    jd: string,                     // nội dung JD (textarea)
  } | null,
  audioTestPassed: boolean,
  videoSetupConfirmed: boolean,
  // Sau khi vào room:
  questions: Array<{
    id, type, level, text, tags[], mustHave, sampleAnswer
  }>,
  answers: Array<{
    qid, text, durationMs, skipped, startedAt, endedAt
  }>,
  transcriptLog: Array<{ role: 'ai' | 'user', text, atMs }>,
  skipStreak: number,               // đếm skip liên tiếp
  // Kết quả:
  feedback: null | {
    overallScore: number,           // 0..100
    overallLabel: string,           // 'Xuất sắc' | 'Tốt' | 'Khá' | 'Cần cải thiện'
    hrPersona: { name, role, tone, opener, closer },
    criteria: Array<{ key, label, score, color }>,
    transcript: Array<{
      qid, question, answer, status: 'pass' | 'improve' | 'skipped',
      suggestions: Array<{ tag: 'must-have' | 'nice-to-have', text }>
    }>,
    summary: string,                // 1-2 câu tổng quan
    seed: number,                   // random seed
  },
  startedAt: number,                // ms
  endedAt: number,
}
```

## 4. 10 bước — mapping route

| # | Route | Trang | Lưu session | Validate trước khi next |
|---|---|---|---|---|
| 1 | `/interview/job-selection` | JobSelection | `job` | `job != null` |
| 2 | `/interview/cv-status` | CVStatus | `cvStatus` | `cvStatus != null` |
| 3 | `/interview/experience-level` | ExperienceLevel | `experienceLevel` | `experienceLevel != null` |
| 4 | `/interview/career-goal` | CareerGoal | `careerGoal` | optional, button luôn enable |
| 5 | `/interview/setup` | InterviewSetup | `interviewConfig` | `type + language + duration + company + jd` |
| 6 | `/audio-setup` | AudioSetup | `audioTestPassed` | `audioTestPassed === true` |
| 7 | `/video-setup` | VideoSetup | `videoSetupConfirmed` | `videoSetupConfirmed === true` |
| 8 | `/interview/room` | InterviewRoom | `questions + answers + skipStreak` | n/a (cuối luồng active) |
| 9 | `/interview/review` | VideoReview | — | — |
| 10 | `/interview/result` | InterviewResult | `feedback` | n/a |

**Progress bar**: dùng `step` từ session (set khi page mount). Mỗi trang setup hiển thị `Bước N/10` + bar fill `N/10 * 100%`.

## 5. State machine — InterviewRoom

```
States:
  idle        : chưa bắt đầu, hiện nút "Bắt đầu phỏng vấn" (chỉ ở lần đầu)
  asking      : AI đang "đọc" câu hỏi (typing 2.5s, KHÔNG hiện text câu hỏi)
  recording   : hiện text câu hỏi + mic thu + voice activity
  processing  : AI "nghe" (1.2s) + lưu answer
  between     : chờ 5s trước câu kế
  ending      : navigate sang /interview/review
```

**Transitions**:
- `idle → asking`: tự động khi page mount (nếu có `questions[]`).
- `asking → recording`: sau 2.5s timer.
- `recording → processing`:
  - Khi user nói cụm kết thúc (`xin hết|hết rồi|xong rồi|hết câu|that's it|that is it|im done|i'm done`, case-insensitive) → ngay lập tức.
  - Khi 1.5s im lặng **SAU** lần nói cuối, và đã nói ≥ 3s.
  - Khi 10s im lặng tuyệt đối (tính từ đầu `recording` hoặc từ lần nói cuối) → `skipped=true`.
- `processing → between`: 1.2s xong.
- `between → asking` (câu kế):
  - User click "Sẵn sàng" → ngay lập tức.
  - User nói bất kỳ voice activity → ngay lập tức.
  - 5s im lặng → `skipped=true` → `asking` câu kế.
- `between → ending`:
  - Hết câu cuối → tự động.
  - `skipStreak === 2` (sau 2 skip liên tiếp) → toast "Phiên phỏng vấn kết thúc tự động" → navigate.

**Skip counting**:
- Mỗi lần `skipped=true` → `skipStreak++`.
- Mỗi lần user trả lời thật (không skip) → `skipStreak = 0`.
- `skipStreak >= 2` → force end.

**Voice activity** (Web Audio API):
- `MediaStream` → `AudioContext` → `AnalyserNode` (fftSize=512).
- Mỗi 100ms: `getByteFrequencyData()` → tính RMS của 0-2000Hz bins.
- `volumeThreshold = 12` (trên thang 0-255) → nếu vượt liên tục 200ms → `isSpeaking = true`.
- Cụm kết: dùng regex trên rolling transcript 5s gần nhất.

**Mic permission**:
- Click Mic lần đầu → `navigator.mediaDevices.getUserMedia({ audio: true })`.
- Từ chối → toast "Cần cấp quyền mic để phỏng vấn" + vẫn chạy timer 10s giả lập (volume = 0 mãi → skip sau 10s).

## 6. UI chi tiết — InterviewRoom

**Layout**:
```
┌─────────────────────────────────────────────────────┐
│ [Logo]  ● PHÒNG PHỎNG VẤN              ⏱ 12:45    │  ← header
├─────────────────────────────────────────────────────┤
│                                                     │
│              ┌────────────┐                         │
│              │  AI avatar │  ← pulse when asking    │
│              │   (64px)   │                         │
│              └────────────┘                         │
│                                                     │
│       ▌▌▌▌▌▌▌▌▌▌▌▌▌▌▌▌▌▌▌▌  ← waveform            │
│                                                     │
│       [● Đang ghi âm — còn 8s]  ← status pill      │
│                                                     │
│   ┌────────────────────────────────────────────┐    │
│   │ Câu hỏi hiện tại (chỉ hiện sau 2.5s)       │    │
│   │ "Hãy giới thiệu bản thân trong 2 phút..."  │    │
│   └────────────────────────────────────────────┘    │
│                                                     │
│   ┌─ Chat transcript (scrollable) ─────────────┐    │
│   │ [AI]: Câu hỏi 1...                          │    │
│   │ [Bạn]: Câu trả lời...                       │    │
│   │ [AI]: Câu hỏi 2...                          │    │
│   └─────────────────────────────────────────────┘    │
│                                                     │
├─────────────────────────────────────────────────────┤
│ [🎤 Mic]  [⚙ Settings]      [⏭ Sẵn sàng câu tiếp] │  ← footer
└─────────────────────────────────────────────────────┘
```

**Ẩn/hiện**:
- KHÔNG có side panel danh sách câu hỏi.
- KHÔNG có AI suggestion box.
- KHÔNG có nút "Hoàn thành câu hiện tại" / "End interview".
- Chỉ 1 nút `Sẵn sàng` ở state `between` (cũng tự động khi có voice activity).

**Câu kết thúc**:
- Ẩn câu cũ (text + transcript) sau 0.5s fade.
- Chuyển sang `between` status "Câu tiếp theo sau 5s…".

## 7. UI chi tiết — InterviewResult

**Layout 2 cột** (mobile: stack vertical):

**Cột trái** (40%):
- **Card HR persona**: avatar + tên `Anh Minh — HR FPT` + tone "Chuyên nghiệp, khuyến khích" + opener quote.
- **Card Tổng điểm**: vòng tròn SVG (0-100) + label + 1 câu summary.
- **Card 5 tiêu chí**: progress bar cho từng tiêu chí.
- **Action buttons**: "Lưu kết quả" + "Lịch sử".

**Cột phải** (60%, sticky):
- Header: "Bản ghi hội thoại & Đánh giá" + badge counts.
- Scrollable chat log (mỗi câu = 1 block).
- Mỗi block: [AI] câu hỏi → [User] trả lời (hoặc "Đã bỏ qua") → badge status → suggestion box(es).
- Footer: "Xuất báo cáo PDF" (giả lập download).

**Tag styling**:
- `must-have`: badge đỏ, border đỏ, nền đỏ nhạt.
- `nice-to-have`: badge xanh, border xanh, nền xanh nhạt.

## 8. Mock data specs

### `companies.js`
```js
export const COMPANIES = [
  {
    id: 'fpt',
    name: 'FPT Software',
    industry: 'IT',
    culture: 'Đổi mới sáng tạo, hợp tác, tinh thần học hỏi không ngừng',
    slogan: 'Không ngừng sáng tạo, không ngừng vươn xa',
  },
];
```

### `questionBank.js` (mỗi câu)
```js
{
  id: 'hr-001',
  type: 'HR' | 'Technical' | 'Behavioral',
  level: 'Intern' | 'Junior' | 'Senior' | 'Expert' | 'all',
  text: '...',
  tags: ['teamwork', 'star'],
  mustHave: true,             // dựa trên frequency FPT cho Technical; HR/BH do author đánh
  sampleAnswer: '...',         // dùng cho feedback generation
  keywordsForMatch: ['react', 'team', '...'],   // dùng tính điểm Technical
}
```

**Nguồn câu hỏi**:
- **HR**: 6-8 câu về văn hóa FPT, teamwork, học hỏi, mục tiêu nghề nghiệp.
- **Behavioral**: 6-8 câu STAR theo level (Intern → tình huống học tập, Expert → leadership).
- **Technical**: lấy từ `docs/FPT/*.csv` — chọn 8-10 LeetCode problem phổ biến nhất (frequency ≥ 60) + 2-3 system design cơ bản cho Senior/Expert.

**Sinh bộ câu hỏi cho 1 session**:
- duration=5 → 3 câu, =10 → 5 câu, =15 → 7 câu.
- 70% câu theo `type` đã chọn, 30% câu HR/behavioral chung.
- Lấy ngẫu nhiên từ bank phù hợp với `experienceLevel`.

### `feedbackRubric.js`
```js
{
  criteria: [
    { key: 'communication', label: 'Giao tiếp', baseScore: 70, weight: 1 },
    { key: 'content',       label: 'Nội dung',   baseScore: 65, weight: 1 },
    { key: 'confidence',    label: 'Tự tin',     baseScore: 60, weight: 1 },
    { key: 'structure',     label: 'Cấu trúc',   baseScore: 65, weight: 1 },
    { key: 'technical',     label: 'Kỹ thuật',   baseScore: 60, weight: 1.2, onlyForType: 'Technical' },
  ],
  tagDefinitions: {
    'must-have':   { color: 'red',    label: 'Must-have' },
    'nice-to-have':{ color: 'green',  label: 'Nice-to-have' },
  },
  hrPersonas: {
    FPT: {
      HR:        { name: 'Anh Minh', role: 'HR — FPT',  tone: 'Chuyên nghiệp, thân thiện' },
      Technical: { name: 'Anh Hùng', role: 'Tech Lead — FPT', tone: 'Sắc sảo, đánh giá cao' },
      Behavioral:{ name: 'Chị Lan',  role: 'HR Manager — FPT', tone: 'Empathetic' },
    },
  },
}
```

## 9. Feedback generation rule

Chạy khi vào `/interview/result`:

1. **Overall score**:
   ```
   base = 50
   base += (answeredCount / totalCount) * 30
   base += (mustHaveAnsweredCount * 5)
   base -= (skippedCount * 5)
   base += random(seed, -5, +5)
   clamp(base, 0, 100)
   ```

2. **5 tiêu chí**:
   - **Communication**: `(avg answer length in words) * factor` — clamp 0-100.
   - **Content**: `(non-empty answer count / total) * 100`.
   - **Confidence**: `100 - (skippedCount * 15) - (avgStartDelay > 5s ? 20 : 0)`.
   - **Structure**: behavioral type → % câu dùng STAR-like (mock: 50% baseline).
   - **Technical** (chỉ type=Technical): match `userAnswer` vs `question.keywordsForMatch` → % match.

3. **HR persona**: lấy theo `interviewConfig.type` + `companies[0]`.

4. **Suggestions per câu**:
   - Skip → 1 must-have (rút từ `sampleAnswer`).
   - Trả lời → so keyword match:
     - <30% match → 1 must-have.
     - 30-70% match → 1 nice-to-have.
     - >70% match → 0 suggestion.

5. **Summary**: 1-2 câu dựa trên overall + top 1 must-have suggestion.

## 10. File changes

**Tạo mới** (8 files):
- `src/constant/jobs.js`
- `src/constant/companies.js`
- `src/constant/experienceLevels.js`
- `src/constant/interviewTypes.js`
- `src/constant/questionBank.js`
- `src/constant/feedbackRubric.js`
- `src/constant/stepDefinitions.js`
- `src/hooks/useInterviewSession.js`

**Sửa** (10 files):
- `src/components/layout/AppLayout.jsx` — thêm guard cho room/result.
- `src/pages/interview/JobSelection.jsx` — lưu `job`, progress 1/10.
- `src/pages/interview/CVStatus.jsx` — lưu `cvStatus`, progress 2/10.
- `src/pages/interview/ExperienceLevel.jsx` — lưu `experienceLevel`, progress 3/10.
- `src/pages/interview/CareerGoal.jsx` — lưu `careerGoal`, progress 4/10.
- `src/pages/interview/InterviewSetup.jsx` — lưu `interviewConfig`, FPT cố định, progress 5/10, fix nút Back.
- `src/pages/interview/AudioSetup.jsx` — lưu `audioTestPassed`, progress 6/10.
- `src/pages/interview/VideoSetup.jsx` — lưu `videoSetupConfirmed`, progress 7/10.
- `src/pages/interview/InterviewRoom.jsx` — viết lại: state machine + voice activity + timer.
- `src/pages/interview/InterviewResult.jsx` — viết lại: render từ session + feedback generation.
- `src/pages/interview/VideoReview.jsx` — fix back link + progress 9/10.

## 11. Acceptance criteria

1. 10 bước có progress bar chính xác 1/10 → 10/10.
2. Refresh giữa setup (1-7): state mất, có thể đi lại từ step hiện tại.
3. Vào `/interview/room` không có `session.questions` → redirect về step 5 (setup).
4. Vào `/interview/result` không có `session.feedback` → redirect về step 1.
5. Mic thật: bấm Mic → browser hỏi quyền → cho phép → ghi + voice activity hoạt động.
6. Từ chối mic: vẫn thấy UI, timer 10s giả lập chạy → skip sau 10s, không crash.
7. Câu hỏi ẨN trong 2.5s asking → HIỆN khi vào recording.
8. User nói "xin hết" → kết thúc câu ngay lập tức.
9. 2 skip liên tiếp (10s hoặc 5s) → auto-end về review.
10. Result có đủ 5 tiêu chí + transcript + tag must-have/nice-to-have + HR persona FPT.
11. Data mock: chỉ 1 công ty FPT, IT, user IT.
12. KHÔNG có nút End trong InterviewRoom.
13. KHÔNG có AI suggestion box trong InterviewRoom.
14. KHÔNG có side panel danh sách câu hỏi.

## 12. Verification (Claude tự kiểm tra trước khi bàn giao)

- Click qua 10 bước với giá trị mặc định, xác nhận progress bar đồng bộ.
- Vào room: cấp quyền mic → trả lời 1 câu với cụm kết → xác nhận chuyển câu kế.
- Vào room: im lặng 10s → skip → câu kế im lặng 5s → skip → xác nhận auto-end về review.
- Truy cập trực tiếp `/interview/room` (URL hack) → xác nhận redirect về step tương ứng.
- Từ chối quyền mic → xác nhận không crash, timer vẫn chạy giả lập.
- Mở DevTools → kiểm tra `sessionStorage.getItem('interview_session_v1')` có đúng shape.
- Result: xác nhận có 5 tiêu chí + transcript + tag must-have/nice-to-have + HR persona FPT.

## 13. Risks

- `MediaRecorder` API không khả dụng trên một số browser cũ → fallback dùng `AnalyserNode` only, không record.
- Voice activity trên mic khác nhau → threshold 12 có thể cần config; để constant `VAD_THRESHOLD` dễ chỉnh.
- `sessionStorage` mất khi đóng tab → chấp nhận (prototype); production sẽ dùng backend.
- Random seed cho feedback → dùng `session.startedAt` làm seed → cùng session cho ra cùng feedback (debug dễ).

## 14. Out of scope

- Multi-company, multi-industry.
- Real speech-to-text, real AI feedback.
- PDF export thật.
- I18n, accessibility đầy đủ.
- Persistent state qua nhiều tab/device.
- Server-side validation.
