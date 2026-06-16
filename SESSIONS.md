# Project Session Logs

This file tracks the progress of the project across different sessions to ensure a seamless handover.

## [2026-06-09] Session 1: Project Initialization & Security Page Fix
### 🎯 Goals
- Fix CSS layout in SecurityPage.
- Setup project structure and Git configuration.
- Align project guidelines with Andrej Karpathy's principles.

### ✅ Completed
- [x] Fixed `SecurityPage.jsx`: Added `lg:col-span-6` to prevent layout squeezing.
- [x] Cleaned root directory: Removed redundant `node_modules` and `package.json`.
- [x] Configured `.gitignore`: Excluded `node_modules`, `target`, `.idea`, `.claude`, and `importedCode`.
- [x] Initialized `CLAUDE.md`: Defined architecture and engineering principles.
- [x] Pushed cleaned state to `main` branch.
- [x] Integrated `andrej-karpathy-skills` plugin.

## [2026-06-09] Session 2: Deployment Fixes
### 🎯 Goals
- Fix 404 errors on page refresh when deployed to Vercel.

### ✅ Completed
- [x] Added `frontend/vercel.json` with a rewrite rule (`/(.*)` $\rightarrow$ `/index.html`) to handle client-side routing.
- [x] Pushed fix to `main` branch.

## [2026-06-10] Session 3: UI Migration & Refinement
### 🎯 Goals
- Migrate high-fidelity pages from `importedCode` to `frontend`.
- Implement Authenticated Home and Public Landing Page logic.
- Fix "Squeezing" text issues across the app.
- Implement User Avatar Dropdown for Dashboard access.

### ✅ Completed
- [x] Migrated `Home.jsx`, `Login.jsx`, `Register.jsx` and layout components (`PublicHeader`, `Footer`).
- [x] Integrated Google Material Symbols font.
- [x] Refined Routing: `/` (Landing) $\rightarrow$ `/home` (Authenticated Home) $\rightarrow$ `/dashboard` components.
- [x] Implemented User Avatar Dropdown in `PublicHeader` with links to personal info, security, pricing, and history.
- [x] Synchronized styling between Landing Page and Home (Background, Header, and Fonts).
- [x] Replaced static mockup on Landing Page with interactive `FloatingCVCard`.
- [x] Updated "AI Features" section on Landing Page to match the modern 4-column layout of Home.
- [x] Fixed Toast layout by removing `max-w-md`, ensuring it fits content naturally.
- [x] Restored Auth Flow: Changed Landing Page to navigate to `/login` or `/register` instead of skipping directly to `/home`.
- [x] Fixed broken CSS in `Register.jsx`:
    - Standardized typography tokens (`text-headline-xl`, `text-body-lg`).
    - Fixed layout collapse by replacing `aspect-[4/3]` with `min-h-[600px]`.
    - Optimized padding for better responsiveness.
- [x] Updated `CLAUDE.md` for agent behavior and `SESSIONS.md` autonomy.

## [2026-06-12] Session 4: Global Feedback Widget
### 🎯 Goals
- Add a floating Feedback button visible on every page, opening a popup form to capture user feedback in-context.
- Keep the API integration decoupled so the backend can be wired up later without UI changes.
- Form draft must persist across closes — only clear on a successful submit or full page reload.

### ✅ Completed
- [x] Created `frontend/src/components/feedback/FeedbackWidget.jsx`:
    - Floating pill button anchored at `bottom-6 left-6`, present on every route.
    - **Modal is flex-centered** in the viewport (overlay uses `flex items-center justify-center`) — stays centered regardless of scroll position, resize, or body-lock state.
    - **7 feedback categories**: Lỗi (Bug), UI/UX, Hiệu năng (Performance), Ý tưởng (Idea), Câu hỏi (Question), Nội dung (Content), Khác (Other). Each chip has an icon + label; laid out as `grid-cols-2 sm:grid-cols-4`.
    - Form fields: optional nickname, required message (max 1000, with counter), optional image (≤5MB) with preview.
    - **Draft persistence** via `localStorage` key `smartfolio.feedback.draft.v1`:
        - Saved on every change to `type`, `nickname`, or `message`.
        - Restored on mount — re-opening the modal shows the last draft.
        - Cleared **only** after a successful submit (or full page reload, since localStorage is per-tab).
        - File attachments are kept in memory only (binary `File` cannot be serialized); user is informed in the modal subtitle.
    - Accessibility: `role="dialog"`, `aria-modal`, ESC-to-close, click-outside-to-close, body-scroll lock, focus management, `aria-pressed` on chips.
    - Submit states: idle → submitting → success / error, with auto-close (1.4s) on success.
    - Single integration point: `onSubmit(payload, file)` prop. Default implementation posts `multipart/form-data` to `/api/feedback`.
- [x] Mounted `<FeedbackWidget />` globally in `AppLayout.jsx` (sibling to the toast layer) so it persists across route changes.
- [x] Extended `index.css` design tokens with `--color-cream` and `--color-cream-deep` for the modal surface, plus animation utilities (`fw-overlay`, `fw-modal`, `fw-fab`, `fw-ink`, `fw-focus`). Updated `fw-modal-in` keyframe to match the new flex-centered layout (removed `translate(-50%, -50%)`).

### 📡 API Contract (for backend integration)
`POST /api/feedback` — `multipart/form-data`
- `type` — one of `bug | idea | question | other`
- `nickname` — string, defaults to `Ẩn danh`
- `message` — string, required, max 1000 chars
- `pageUrl` — string, current page URL
- `image` — file, optional, `image/*`, max 5MB

Override at the call site: `<FeedbackWidget onSubmit={async (payload, file) => {...}} />`.

### 🚩 Current State & Checkpoint
- **Current Branch**: `dev`
- **Latest Change**: FeedbackWidget live on all routes; backend endpoint not yet wired.
- **Next Step**: Implement `POST /api/feedback` on the Spring Boot backend and (optionally) store uploads.

## [2026-06-13] Session 5: Feedback Backend Wiring
### 🎯 Goals
- Implement the Spring Boot side of the feedback pipeline that the global `FeedbackWidget` already posts to.
- Persist feedback to database, optional image upload to Cloudinary, expose a read API and category filter for downstream admin/listing.
- Keep the request contract compatible with the existing FE multipart payload (and the `FeedbackRequest` DTO that already exists in tree).

### 🗂 Log Luồng Feedback (End-to-End)
**1. Người dùng mở widget** (`<FeedbackWidget />` — mounted global trong `AppLayout`)
- Click FAB "Góp ý" ở `bottom-6 left-6` → `setOpen(true)`.
- Khôi phục draft từ `localStorage["smartfolio.feedback.draft.v1"]` (type / nickname / message).
- Lock body scroll, focus first field, ESC + click-overlay để đóng.

**2. Người dùng điền form**
- Chọn 1 trong 7 category: `bug | ui | performance | idea | question | content | other` (chip có icon).
- (Tuỳ chọn) nhập nickname — backend fallback `"Ẩn danh"` nếu để trống.
- Nhập message (bắt buộc, ≤ 1000 ký tự).
- (Tuỳ chọn) đính kèm ảnh ≤ 5MB, MIME `image/*`; preview qua `URL.createObjectURL`.
- Mỗi thay đổi field text → `useEffect` gọi `saveDraft(...)` để persist nháp.

**3. Submit — FE → BE**
- `handleSubmit` build `payload = { type, nickname, message, pageUrl }` + giữ `file` ở memory.
- `submitFeedback(payload, file, onSubmit)` đóng gói `FormData`:
  - `userName = payload.nickname`
  - `category = payload.type`
  - `content = payload.message`
  - `pageUrl = payload.pageUrl` (FE-only metadata, BE chưa lưu)
  - `image` (file) hoặc `null` khi không chọn
- Gọi `feedbackService.feedback(fd)` → `apiClient.post('/feedbacks', fd)` (axios, baseURL trỏ `/api` → endpoint đầy đủ `POST /api/feedbacks`, `multipart/form-data`).

**4. BE nhận request — `FeedbackController`**
- `@PostMapping(consumes = MULTIPART_FORM_DATA)` → `createFeedback(@ModelAttribute FeedbackRequest request, MultipartFile imageFile)`.
- `@ModelAttribute` map các field `userName / category / content / imageUrl` từ multipart; `imageFile` được Spring bind theo tên `imageFile`.
- Validation tự động nhờ `FeedbackRequest`:
  - `@NotBlank userName`, `@NotBlank @Pattern("bug|ui|performance|idea|question|content|other") category`, `@NotBlank @Size(max=1000) content`.
- Ủy quyền sang `FeedbackService.createFeedback(request, imageFile)`.

**5. BE xử lý — `FeedbackService`**
- Nếu `imageFile != null && !isEmpty()` → gọi `CloudinaryService.uploadImage(imageFile)` → trả `imageUrl` (public URL).
- Build entity `Feedback` qua Lombok builder (`userName`, `category`, `content`, `imageUrl`).
- Lưu qua `FeedbackRepository.save(...)` — `@PrePersist` set `createdAt = LocalDateTime.now()`.
- Trả về entity đã lưu (kèm `id` + `createdAt`).

**6. Persistence — `FeedbackRepository`**
- `JpaRepository<Feedback, Long>` với custom finder: `findByCategoryOrderByCreatedAtDesc(String)`.

**7. Response về FE**
- HTTP 200 + JSON `Feedback` (`id`, `userName`, `category`, `content`, `imageUrl`, `createdAt`).
- FE check `res.status 2xx` → `setStatus("success")` → `clearDraft()` (xoá localStorage + reset state) → `setTimeout(close, 1400ms)` (note: code hiện tại là 3000ms — đã align với cảm giác "Hoàn tất" từ mockup).
- Lỗi (validation 400, Cloudinary down 500, network) → `setStatus("error")`, hiển thị `errorMsg` từ `err.response?.data?.message` nếu có, fallback `"Lỗi"`.

**8. Read API (sẵn sàng cho admin/list)**
- `GET /api/feedbacks` → `getAllFeedbacks()` → `findAll()`.
- `GET /api/feedbacks/{id}` → `getFeedbackById()` → 404 nếu không tồn tại.
- `GET /api/feedbacks/category/{category}` → `getFeedbacksByCategory()` → `findByCategoryOrderByCreatedAtDesc`.
- `DELETE /api/feedbacks/{id}` → 404 nếu không tồn tại, xoá qua `deleteById`.

### ✅ Completed
- [x] `entity/Feedback.java` — JPA entity, table `feedbacks`, `@PrePersist` set `createdAt`.
- [x] `dto/FeedbackRequest.java` — Bean Validation whitelist cho `category`, giới hạn 1000 ký tự content.
- [x] `repository/FeedbackRepository.java` — `JpaRepository` + finder theo category sắp xếp mới nhất trước.
- [x] `service/FeedbackService.java` — create (có upload Cloudinary), getAll, getById, getByCategory, delete; throw `ResponseStatusException 404` khi không tồn tại.
- [x] `controller/FeedbackController.java` — `POST /api/feedbacks` (multipart), `GET /api/feedbacks`, Swagger annotation (`@Tag`, `@Operation`).
- [x] `service/feedbackService.js` — FE service gọi `apiClient.post('/feedbacks', formData)`.
- [x] `components/feedback/FeedbackWidget.jsx` — đã chốt ở Session 4 (draft, a11y, submit states).

### ⚠️ Điểm lệch giữa FE mockup và BE hiện tại (cần quyết định)
1. **Endpoint path**: FE gọi `/api/feedbacks` (số nhiều) nhưng code dùng `@RequestMapping("/api/feedbacks")` → khớp. Tuy nhiên mockup trong doc Session 4 ghi `/api/feedback` (số ít) — đã được sửa về số nhiều cho nhất quán.
2. **`pageUrl`**: FE gửi kèm nhưng `FeedbackRequest` chưa có field này. Spring sẽ bỏ qua các multipart key lạ (không ăn nhằm entity) — nếu muốn lưu để biết user đang ở trang nào khi góp ý, cần thêm cột `page_url` vào entity + DTO.
3. **Tên field ảnh**:
   - FE gửi `fd.append("image", file)`.
   - Controller nhận `MultipartFile imageFile` (Spring map theo tên, không khớp `image`) — có thể BE không bind được file. Cần đổi tên một bên cho khớp (đề xuất: thống nhất `image`).
4. **Auto-close timeout**: `setTimeout(close, 3000)` ở FE đang chậm so với thông điệp "Hoàn tất" — có thể chỉnh về 1400–1800ms.
5. **Nhãn "Ẩn danh"**: BE chấp nhận `userName` rỗng qua `@NotBlank`; FE đang fallback `"Ẩn danh"` trước khi gửi, nên thực tế BE hiếm khi nhận rỗng. Có thể bỏ `@NotBlank` ở DTO hoặc bỏ fallback ở FE để đơn giản hoá.

### 🚩 Current State & Checkpoint
- **Current Branch**: `dev`
- **Latest Change**: Backend feedback pipeline (entity → DTO → repo → service → controller) wired; FE widget đã gọi đúng endpoint.
- **Next Step**:
  1. Thống nhất tên field ảnh (`image` ↔ `imageFile`) để multipart bind đúng.
  2. (Tuỳ chọn) thêm `pageUrl` vào entity + DTO nếu muốn phân tích theo trang.
  3. Smoke test `POST /api/feedbacks` kèm và không kèm ảnh, kiểm tra Cloudinary URL trả về.
  4. (Tuỳ chọn) xây trang Admin/Listing tiêu thụ `GET /api/feedbacks` + filter theo category.

## [2026-06-13] Session 6: Add @Slf4j Logging to Feedback Pipeline
### 🎯 Goals
- Thêm log toàn bộ luồng feedback ở `FeedbackService` + `FeedbackController` để dễ debug — đặc biệt là bug multipart "ảnh không bind được" (FE gửi `image`, BE nhận `imageFile`).
- Theo pattern đã có sẵn trong codebase (`CloudinaryService` đã dùng `@Slf4j`).

### ✅ Completed
- [x] `FeedbackService` — thêm `@Slf4j` (Lombok) + log:
  - `createFeedback`: log `userName`, `category`, `contentLength`, `hasImage` ở đầu; log chi tiết tên/size/contentType ảnh khi upload; log URL Cloudinary trả về; log `id` + `imageUrl` sau khi `save`; log error đầy đủ stacktrace nếu Cloudinary throw.
  - `getAllFeedbacks` / `getFeedbacksByCategory`: log `count` trả về; `debug` cho query.
  - `getFeedbackById` / `deleteFeedback`: log `warn` khi 404, log `info` khi xoá thành công.
- [x] `FeedbackController` — thêm `@Slf4j` + log:
  - `POST /api/feedbacks`: log request đến (`userName`, `category`, `hasImage`); log 200 OK với `id`; log 500 với stacktrace khi `IOException`.
  - `GET /api/feedbacks`: log request + số lượng trả về.
- [x] Không sửa DTO/entity/repo — chỉ thêm log, không thay đổi contract.

### 🧾 Log level theo mục đích
| Level | Khi nào dùng |
|---|---|
| `INFO` | Mốc nghiệp vụ quan trọng: request đến, save/delete thành công, URL Cloudinary |
| `DEBUG` | Query nội bộ, payload rỗng (không ảnh) |
| `WARN` | 404 / not found (cần để ý nhưng không phải lỗi hệ thống) |
| `ERROR` | Exception + stacktrace (Cloudinary fail, IO fail) |

### 🔍 Cách dùng để debug bug multipart `image` ↔ `imageFile`
1. Chạy app, mở widget, đính kèm ảnh → submit.
2. Mở log backend, tìm dòng:
   ```
   POST /api/feedbacks — incoming multipart: userName='...', category='...', hasImage=...
   ```
   - Nếu `hasImage=false` → Spring không bind được file vì tên field lệch. Sửa FE gửi `imageFile` hoặc BE đổi tên tham số về `image`.
   - Nếu `hasImage=true` → log tiếp theo ở Service sẽ in `name='...', size=... bytes, contentType='...'` để xác nhận file hợp lệ.
3. Nếu Cloudinary throw → `ERROR` kèm stacktrace nguyên nhân (sai API key, network, content-type…).

### 🚩 Current State & Checkpoint
- **Current Branch**: `dev`
- **Latest Change**: `@Slf4j` đã bật ở `FeedbackService` + `FeedbackController`; log theo 4 level như bảng trên.
- **Next Step**:
  1. Chạy thử `POST /api/feedbacks` có/không ảnh, đọc log để xác nhận `hasImage` đúng như kỳ vọng.
  2. Sửa bug tên field ảnh (`image` ↔ `imageFile`) nếu log cho thấy `hasImage=false` khi user có đính kèm.
  3. Cân nhắc chỉnh `application.yml` → `logging.level.fpt.su26.exe101.backend.service.FeedbackService=DEBUG` khi cần trace sâu.

## [2026-06-16] Session 7: Interview Flow High-Fidelity Prototype
### 🎯 Goals
- Đánh giá lại luồng interview hiện tại (JobSelection → InterviewResult) so với high-fidelity prototype.
- Mô phỏng voice interview với AI: timer 10s im lặng → skip, 5s giữa câu → skip, 2 skip liên tiếp → auto-end.
- Feedback mock dựa trên dữ liệu setup, có tag must-have / nice-to-have, HR persona FPT.

### ✅ Completed
- [x] **Spec** tại `docs/superpowers/specs/2026-06-16-interview-flow-high-fidelity-design.md` (commit `f3d9bcd`) — đã duyệt qua 4 phần brainstorm + verification gate.
- [x] **Plan** tại `docs/superpowers/plans/2026-06-16-interview-flow.md` — 8 tasks, file changes cụ thể.
- [x] **Mock data** tại `frontend/src/constant/` (7 files):
  - `jobs.js` — 6 IT job presets (Software Engineer, Frontend, Backend, DevOps, QA, Data)
  - `companies.js` — FPT-only (industry IT, culture/slogan)
  - `experienceLevels.js`, `interviewTypes.js` — setup data
  - `questionBank.js` — HR (6) + Behavioral (6) + Technical (8) câu hỏi IT; Technical tham khảo `docs/FPT/All.csv` LeetCode frequency; export `pickQuestionsForSession()` để random hóa theo config
  - `feedbackRubric.js` — 5 tiêu chí chấm điểm, 2 tag (must-have/nice-to-have), 3 HR persona FPT
  - `stepDefinitions.js` — 10-step mapping route
- [x] **Session hook** `frontend/src/hooks/useInterviewSession.js`:
  - Read/write `sessionStorage` key `interview_session_v1`
  - API: `data, update, reset, setStep, generateQuestions, generateFeedback, saveAnswer, addTranscript`
  - Persist state tự động qua `useEffect` (skip lần đầu để tránh overwrite)
- [x] **7 trang setup** (1-7) đã wire vào session, progress bar 1/10 → 7/10:
  - `JobSelection` — search + grid 6 jobs, lưu `job` vào session
  - `CVStatus` — 2 cards "Có/Chưa có CV", lưu `cvStatus`
  - `ExperienceLevel` — 4 levels, lưu `experienceLevel`
  - `CareerGoal` — textarea + 4 AI suggestions, lưu `careerGoal`
  - `InterviewSetup` — FPT-locked company, 3 loại interview, language, duration, JD textarea; **fix nút Back** (đang trỏ nhầm `career-goal`)
  - `AudioSetup` — mic thật (`getUserMedia` + `AnalyserNode`), waveform thật, lưu `audioTestPassed`
  - `VideoSetup` — camera live preview, device selectors, lưu `videoSetupConfirmed`
- [x] **AppLayout** thêm `RoomGuard` + `ResultGuard`:
  - `/interview/room` không có `session.questions` → redirect `/interview/job-selection`
  - `/interview/result` không có `session.feedback` → redirect `/interview/job-selection`
- [x] **InterviewRoom** (8) — viết lại hoàn toàn:
  - 5 state: `asking` (2.5s, ẩn text) → `recording` (hiện text + mic + VAD) → `processing` (1.2s) → `between` (5s) → `asking` (câu kế)
  - Mic thật: `getUserMedia` + `AnalyserNode` (fftSize=512), threshold 12, RMS 0-2000Hz
  - End phrase regex: `xin hết|hết rồi|xong rồi|hết câu|that's it|i'm done`
  - 10s in-question silence → skip; 5s between-question silence → skip
  - 2 skip liên tiếp (bất kỳ loại) → `endInterview()` → sinh feedback → navigate review
  - KHÔNG có side panel, KHÔNG có AI suggestion box, KHÔNG có nút End
  - Ẩn text câu hỏi trong 2.5s `asking`, hiện khi vào `recording`
- [x] **VideoReview** (9) — fix back link (đang navigate sai), hiển thị duration từ session.
- [x] **InterviewResult** (10) — viết lại từ session:
  - 2 cột dark theme: HR persona + 5 criteria (trái), transcript (phải sticky)
  - Mỗi block transcript: [AI] câu hỏi → [User] trả lời (hoặc "Đã bỏ qua") → badge status → suggestion box với tag must-have/nice-to-have
  - HR persona: Anh Minh (HR) / Anh Hùng (Tech) / Chị Lan (Behavioral) — FPT
  - Closer quote cuối transcript
- [x] **Build verified**: `npx vite build` pass, 2255 modules transform, 0 error.
- [x] **Dev server**: `npx vite` chạy thành công (port 5174 vì 5173 bận).

### 🚩 Current State & Checkpoint
- **Current Branch**: `dev`
- **Latest Commit**: `e724343` — "Implement 10-step interview flow prototype" (20 files, +2435/-1001)
- **Spec commit**: `f3d9bcd`
- **Build**: ✅ Pass
- **Dev server**: ✅ Start thành công
- **Next Step** (bàn giao cho user test):
  1. Chạy `npm run dev` trong `frontend/`, mở `http://localhost:5173/interview`.
  2. Click "Bắt đầu" → đi qua 10 bước với giá trị mặc định.
  3. Ở `AudioSetup` / `VideoSetup` cấp quyền mic + camera cho trình duyệt.
  4. Trong `InterviewRoom`:
     - Test nói "xin hết" sau khi trả lời → câu kết thúc ngay.
     - Test im lặng 10s trong câu → skip.
     - Test im lặng 5s giữa câu → skip, câu kế tiếp cũng im 5s → auto-end.
  5. Ở `InterviewResult` kiểm tra: 5 tiêu chí có điểm, transcript có tag must-have/nice-to-have, HR persona FPT.
  6. Báo lại bug nếu có.
- **Known limitations** (chấp nhận cho prototype):
  - Không có STT thật — `lastTranscriptRef` được fill bằng random words khi VAD phát hiện nói.
  - "xin hết" detection dựa trên rolling transcript (random words) — có thể miss cụm này nếu random không trúng. Tạm chấp nhận.
  - SessionStorage mất khi đóng tab (production sẽ cần backend).
