# Frontend Structure Cleanup Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the frontend easier to navigate by clarifying file ownership, removing only verified orphaned assets, and organizing styles and helpers by responsibility without changing product behavior.

**Architecture:** Keep feature-first folders. Use shared root modules only for cross-feature infrastructure, feature `services` for API/external-system I/O, `hooks` for React hooks, `domain` for feature rules/workflows, `utils` for small pure helpers, and a CSS tree with one global `index.css` plus at most one shared page stylesheet per feature. Page-specific utility classes stay with the page JSX; keep PDF-renderer CSS isolated. Apply moves in dependency-aware batches and update imports with each batch.

**Tech Stack:** React 19, Vite, Tailwind CSS 4, React Router, Node's built-in test runner.

## Execution sequencing amendment

Use `.spec/frontend-structure-cleanup-spec.md` as the authoritative execution sequence. The implementation must have exactly one stage for every direct directory under `frontend/src/features/` at execution time; the current count is eight. Do not add separate infrastructure, CSS, or cleanup stages. Audit and complete one feature at a time, report it, and wait for the user's explicit confirmation before proceeding. If a feature already complies, report the evidence without editing files or making an empty commit. If it needs changes, run checks, create and inspect one feature-scoped commit, then report the commit and wait. The task sections below are a technical checklist grouped by concern, not a batch order. Never stage unrelated existing workspace changes.

## Global Constraints

- Preserve route behavior, API behavior, user-facing copy, and visual design during the structural cleanup.
- Confirm every candidate's complete import/reference graph before removing or moving it; names such as `mock`, `service`, or `hook` are not proof of usage or ownership.
- Keep test fixtures and data that are used by a route, test, or development workflow.
- `frontend/src/index.css` is the global stylesheet. Keep design tokens and cross-feature base rules there; keep feature-specific rules out of it.
- Each feature may have one shared stylesheet for styles used across that feature's pages. Do not create a separate stylesheet for every page.
- Keep page-specific Tailwind classes and one-off page styles with the page JSX. Extract a JSX style pattern into the feature stylesheet only when multiple pages in that feature share it or it represents a shared semantic pattern.
- Organize styles as a cascade tree: global `index.css` → one shared stylesheet for a feature → page-specific classes/styles in the page JSX. Scope feature selectors so they do not leak into other features.
- Keep `EditableCvHtmlTemplate.css` isolated because the PDF renderer inlines it.
- Do not touch unrelated staged or modified work already present in the workspace.

## Review Focus

- A candidate data file may be indirectly needed by a route or test even when its name suggests it is old; confirm the whole dependency chain before deletion.
- Moving shared API modules must preserve every caller and avoid duplicate endpoints such as gallery asset loading from more than one feature service.
- Moving CSS must preserve import order, selector scope, responsive behavior, and focus/hover states.
- CSS used by PDF export must remain available to the inline renderer and not become dependent on application-global styles.
- File moves must leave no stale imports, broken tests, or changed public routes.

---

### Task 1: Establish a frontend ownership map and conventions

**Files:**
- Read: `frontend/src/`
- Read: `frontend/tests/`
- Read: `frontend/src/components/layout/AppLayout.jsx`
- Read: all current CSS files under `frontend/src/`

**Interfaces:**
- Record each file as active, unused candidate, API/external integration, React hook, feature rule/workflow, pure utility, component, or style.
- Use these ownership rules for subsequent tasks: `services` performs API/external/browser I/O; `hooks` contains React hooks; `domain` contains feature rules and multi-step pure workflows; `utils` contains small pure helpers; `components` contains React UI; `styles` contains feature-wide CSS.
- Keep the shared HTTP client in one root infrastructure location; feature endpoint APIs belong to their owning feature.

- [ ] **Step 1: Trace imports and consumers before making changes**

Build a short inventory of CSS imports, repeated `className` utility sequences, inline `style` props, mock/static data imports, API service methods and callers, helpers in `services`, non-hook files in `hooks`, and non-component files in `components`. Include the duplicate gallery-assets call and note whether each proposed move is local to a feature or cross-feature.

- [ ] **Step 2: Confirm the cleanup boundaries**

Keep this pass structural. Do not redesign pages, rewrite state management, or change feature behavior. If a file's ownership is ambiguous, keep it in place and record the reason instead of guessing.

### Task 2: Remove or split only verified unused mock/demo files

**Files:**
- Candidate removal after final reference check: `frontend/src/App.css`
- Candidate removal as one dependency group after final reference check: `frontend/src/features/cv/constants/cv-evaluation.js`, `frontend/src/features/cv/constants/cv-mock-data.js`, `frontend/src/constants/jobDescription.js`
- Candidate removal after final reference check: `frontend/src/features/interview/constants/companies.js`
- Candidate removal after final reference check: `frontend/src/features/interview/constants/questionBank.js`
- Candidate removal after final reference check: `frontend/src/features/interview/hooks/deepgramClient.js`
- Create: `frontend/src/features/interview/constants/terminalPhrases.js`
- Modify: `frontend/src/features/interview/pages/InterviewRoom.jsx`

**Interfaces:**
- Preserve `END_PHRASES_VN` and `END_PHRASES_EN`, which are imported by `InterviewRoom.jsx`.
- Preserve `JOBS` in `frontend/src/features/interview/constants/jobs.js`, which is used by `JobSelection.jsx`.
- Keep active test fixtures and any mock data with a live route/test consumer.

- [ ] **Step 1: Add a final zero-consumer check for each deletion candidate**

Search all source and test imports, dynamic imports, route references, and build/test configuration for each candidate. If any candidate has a live consumer, remove it from the deletion list and keep it.

- [ ] **Step 2: Extract active terminal phrases and remove dead question arrays**

Move the two active end-phrase arrays into `terminalPhrases.js` and update `InterviewRoom.jsx`. Then remove `questionBank.js` if the final reference check still confirms its question arrays have no consumer.

- [ ] **Step 3: Delete only confirmed orphaned files**

Remove the confirmed unused Vite starter stylesheet, CV demo evaluation dependency group, unused company preset file, dead question bank, and legacy Deepgram client if the final reference check confirms there are still no consumers. Do not remove `jobs.js`, the extracted terminal phrases, or fixtures with consumers.

- [ ] **Step 4: Run the frontend tests and production build**

Run from `frontend`: `npm test`
Expected: PASS with no removed fixture or import still required.

Run from `frontend`: `npm run build`
Expected: PASS with no unresolved imports.

### Task 3: Standardize service, hook, and helper ownership

**Files:**
- Rename: `frontend/src/service/` to `frontend/src/services/` for shared transport infrastructure
- Move: `frontend/src/service/emailVerificationService.js` to `frontend/src/features/auth/services/emailVerificationService.js`
- Review and split by caller ownership: `frontend/src/service/galleryService.js`
- Move: `frontend/src/features/interview/hooks/useElevenlabsSTT.js` to `frontend/src/features/interview/services/elevenLabsTranscriptionClient.js`
- Move pure interview helpers from `frontend/src/features/interview/services/` to `frontend/src/features/interview/domain/` or `utils/` as appropriate
- Move pure CV workflows from `frontend/src/features/cv/services/` to `frontend/src/features/cv/domain/` or `utils/` as appropriate
- Move: `frontend/src/features/payment/components/paymentServiceInfo.js` to `frontend/src/features/payment/utils/paymentServiceInfo.js`
- Update all imports and affected existing tests
- Update: `frontend/tests/apiClient.test.js`, `frontend/tests/emailVerificationService.test.js`, `frontend/tests/paymentServiceInfo.test.js`, `frontend/tests/analysisFlow.test.js`, `frontend/tests/builderQuota.test.js`, `frontend/tests/editorSave.test.js`, `frontend/tests/interviewRoomStatus.test.js`, `frontend/tests/interviewSpeechClient.test.js`

**Interfaces:**
- Keep `apiClient.js` and shared API error helpers as the only cross-feature transport module.
- Keep API endpoint modules with the owning feature; split `galleryService.js` only along verified endpoint ownership and callers.
- Keep browser/external-system adapters in `services`; place pure rules such as configuration normalization, quota checks, status selection, and presentation mapping in `domain`/`utils`.
- Keep React hooks under `hooks`; `use*` hooks may call feature API services.
- `useElevenlabsSTT.js` exports a client class used by `InterviewRoom.jsx`, not a React hook; move and rename it as a service integration.
- `deepgramClient.js` has no current consumers; treat it as a deletion candidate, not a move, unless the import audit finds an indirect use.
- Do not move `authSession.js` merely because it does not call `apiClient`; it coordinates authentication state and is already feature-owned.

- [ ] **Step 1: Add or update import-boundary checks for moved modules**

Update the relevant existing Node tests to import helpers from their intended owners. Preserve tests for API behavior and pure helper behavior; do not change their expected results.

- [ ] **Step 2: Move the shared transport directory and auth endpoint service**

Rename the singular root `service` directory to plural `services`, update all shared-client/error-helper imports, and move email verification into the auth feature. Keep the client implementation unchanged.

- [ ] **Step 3: Move misclassified helpers and the Deepgram integration**

Move and rename `useElevenlabsSTT.js` as an interview transcription service integration. Move pure functions out of `services` according to the ownership map, and move `paymentServiceInfo.js` out of `components`.

- [ ] **Step 4: Split cross-feature API methods only where ownership is clear**

Map each `galleryService` method to its callers. Move template/catalog methods, user gallery methods, and interview-history methods to their owning feature service only when the call sites support that boundary. Remove duplicate methods after callers share one implementation; retain one shared API client.

- [ ] **Step 5: Run affected existing tests and a production build**

Run from `frontend`: `npm test`
Expected: PASS with all imports resolved and API-helper behavior unchanged.

Run from `frontend`: `npm run build`
Expected: PASS with no stale paths.

### Task 4: Consolidate page styles into one shared stylesheet per feature

**Files:**
- Modify: `frontend/src/index.css`
- Merge: `frontend/src/features/interview/pages/interview-pages.css` and `frontend/src/features/interview/pages/interview-result.css` into `frontend/src/features/interview/interview.css`
- Update repeated style patterns in: `frontend/src/features/interview/pages/InterviewSetup.jsx`, `JobSelection.jsx`, `ExperienceLevel.jsx`, `CareerGoal.jsx`, `CVStatus.jsx`, `AudioSetup.jsx`, `VideoSetup.jsx`, `VideoReview.jsx`, `InterviewRoom.jsx`, and `InterviewResult.jsx`
- Update other feature page files only when Task 1 confirms the same repeated visual pattern is used across them
- Move interview-only global selectors from `frontend/src/index.css` into `frontend/src/features/interview/interview.css`
- Move CV-only global selectors from `frontend/src/index.css` into a CV feature stylesheet only if the audit finds that shared CV page styles justify creating it
- Keep: `frontend/src/features/cv/pdf-renderer/shared/EditableCvHtmlTemplate.css`

**Interfaces:**
- Global layer (`index.css`) retains Tailwind import, design tokens, base/reset styles, and generic transitions/utilities used across features.
- Feature layer allows one stylesheet at `features/<feature>/<feature>.css` for styles shared across that feature's pages/components.
- Page-specific utility classes and one-off styles remain in page JSX; do not create per-page CSS files. Feature CSS may contain narrowly scoped selectors that Tailwind/JSX cannot express.
- Interview flow and result styles share the single `features/interview/interview.css`; selectors stay scoped by interview page/feature classes where needed.
- Do not create a CV page stylesheet unless the audit finds shared application-page styles. CV PDF template CSS remains isolated and inlineable.
- Prefer semantic classes for repeated patterns such as flow cards, form controls, progress bars, and primary/secondary actions. If markup and behavior repeat together, use a shared component instead of a stylesheet-only abstraction.
- Keep page-specific Tailwind utility classes in JSX. Do not create a CSS selector for every element or a separate CSS file for each page.
- **Design call:** use global `index.css` → one shared CSS file per feature when needed → page-specific JSX styles. Do not flatten feature styles into `index.css`.

- [ ] **Step 1: Identify repeated JSX styles, duplicate selectors, and current import order**

Compare repeated Tailwind class sequences and inline styles across page families, then compare the interview page/result stylesheets with the global stylesheet. Extract only styles that are repeated across pages or represent an established semantic pattern; preserve which rules intentionally override Tailwind classes.

- [ ] **Step 2: Move shared interview styles and replace repeated JSX style groups with semantic classes**

Create `features/interview/interview.css`, update page imports and class names, and keep page-specific rules narrowly scoped within that single feature stylesheet when JSX cannot express them. Remove duplicate scrollbar declarations only after one owning rule is established. Keep one-off utility classes in page JSX; do not promote them to the feature/global layers.

- [ ] **Step 3: Move feature-only selectors out of global CSS**

Move `.bg-interview-radial` to the interview feature stylesheet and CV-only selectors only if an existing CV page stylesheet is justified by the audit. Keep design tokens and generic global utilities in `index.css`; keep each feature's shared rules in its one stylesheet and page-specific utility styles beside the page.

- [ ] **Step 4: Run build and visually inspect representative routes**

Run from `frontend`: `npm run build`
Expected: PASS.

Visually compare interview setup, interview result, CV editor/preview, and PDF export before and after the CSS moves. Expected: no layout, focus, responsive, or exported-PDF changes.

### Task 5: Final structure and dependency review

**Files:**
- Read: `frontend/src/`
- Read: `frontend/tests/`

- [ ] **Step 1: Re-run the orphan and ownership inventory**

Confirm no confirmed-dead mock/data/CSS files remain, each `hooks` file exports a React hook, `components` files are UI, and pure helpers are not left in API service directories without a clear reason.

- [ ] **Step 2: Run final frontend checks**

Run from `frontend`: `npm test`
Expected: PASS.

Run from `frontend`: `npm run build`
Expected: PASS.

Review `git diff --check` and `git status --short`; retain all unrelated user changes and report any existing lint/build issue separately from this structural work.

## Handoff

This plan covers structure-only changes. Do not start the cleanup until the user reviews and approves this plan.
