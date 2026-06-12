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
