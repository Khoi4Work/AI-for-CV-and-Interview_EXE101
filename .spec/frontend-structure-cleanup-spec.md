# Execution Spec: Frontend Structure Cleanup

**Status:** Implementation spec
**Scope:** Frontend structure only
**Related plan:** `docs/superpowers/plans/2026-11-09-frontend-structure-cleanup.md`

## 1. Objective

Make the frontend easier to navigate and keep consistent by clarifying where styles, API calls, React hooks, feature logic, utilities, and unused demo data belong.

This work is a structural refactor. Preserve visible behavior, routes, API endpoints and payloads, user-facing text, design, and PDF output. Do not redesign screens or add product functionality as part of this cleanup.

## 2. Target ownership model

Keep the existing feature-first structure. Apply these conventions:

| Concern | Location | Rule |
| --- | --- | --- |
| Global styles and shared transport | `frontend/src/index.css`, `frontend/src/services/` | Global styles stay global; root services are limited to cross-feature transport infrastructure such as `apiClient.js` and shared API error helpers. |
| Feature API or external/browser integration | `frontend/src/features/<feature>/services/` | A service performs API, external SDK, browser media, download, or other I/O for its feature. |
| React state/effect abstraction | `frontend/src/features/<feature>/hooks/` | Files in `hooks/` export actual React hooks. |
| Feature rules and multi-step workflows | `frontend/src/features/<feature>/domain/` | Keep pure business rules, configuration/payload building, quota decisions, request coordination, and multi-step pure workflows here. |
| Small pure helpers and presentation mapping | `frontend/src/features/<feature>/utils/` | Keep deterministic helpers that do not perform I/O or render UI here. |
| UI | `frontend/src/features/<feature>/components/` | Components render or compose UI; move standalone data transformations out. |
| Shared feature styles | `frontend/src/features/<feature>/<feature>.css` | Create at most one shared stylesheet per feature, and only when multiple pages/components share styles. |

Do not introduce a new top-level architecture or move files just to satisfy naming symmetry. If the audit finds a dependency or responsibility not covered by this model, keep the file in place and record the reason in the implementation summary.

## 3. CSS organization

The intended cascade is:

```text
frontend/src/index.css                  global tokens, base/reset, cross-feature utilities
└── frontend/src/features/<feature>/<feature>.css   shared rules for that feature, when needed
    └── page JSX                        page-only Tailwind classes and one-off inline styles
```

Requirements:

1. Keep `index.css` as the global entry point. It owns Tailwind import, design tokens, base styles, and genuinely cross-feature utilities.
   Keep tokens declared in Tailwind's global `@theme` when feature code depends on Tailwind-generated utilities; move a token into a feature stylesheet only if the build continues to generate and resolve every existing class that uses it.
2. Move feature-only selectors out of `index.css` when their feature stylesheet is established. Do not move a selector solely because it is long or inconvenient.
3. Use no more than one shared stylesheet for a feature. Do not create a separate stylesheet for each page.
4. Keep page-specific utility classes and one-off inline styles beside their page JSX. If a page needs a selector that cannot reasonably be represented in JSX/Tailwind, put it in the feature stylesheet under a page-root selector; do not create another page CSS file.
5. Extract repeated JSX class groups only when they represent a shared semantic pattern across pages. Avoid creating a CSS rule for every element or duplicating a shared component's responsibility in CSS.
6. Keep selector scope, import order, responsive behavior, focus/hover/disabled states, transitions, and print behavior unchanged.
7. Keep `frontend/src/features/cv/pdf-renderer/shared/EditableCvHtmlTemplate.css` isolated: the PDF renderer inlines this stylesheet and must not depend on application styles.

### Interview CSS target

- Create `frontend/src/features/interview/interview.css` as the single shared stylesheet for the interview feature.
- Consolidate `frontend/src/features/interview/pages/interview-pages.css` and `frontend/src/features/interview/pages/interview-result.css` into it, then update all imports and remove the old files after confirming they have no consumers.
- Move `.bg-interview-radial` and other interview-only selectors from `index.css` into this file when the selector audit confirms they are interview-specific.
- Keep the setup flow, review/result screen, and report print rules scoped to their current feature/page roots.
- Keep page-only Tailwind and inline styles in the page JSX. Reuse the existing `.interview-flow-*` semantic patterns where they accurately express repeated styles; do not force unrelated pages into those classes.

### Other CSS

- Audit all selectors in `index.css`, not just `.bg-interview-radial`. In particular, classify CV editor/print rules, feedback-widget rules, global transitions, generic glass/shadow utilities, and custom scrollbars by actual consumers.
- Move CV page rules to `frontend/src/features/cv/cv.css` only if multiple CV pages/components share application-page rules. Do not create this file just to relocate CV PDF renderer styles or one-page rules.
- Keep globally used utilities and tokens in `index.css`; feature-specific rules belong to that feature. Preserve `@page` and `@media print` behavior for both CV and interview output.
- `frontend/src/App.css` is a deletion candidate only if the final reference/build-config audit confirms it is unused.

## 4. File ownership and migration decisions

### Shared transport and API services

1. Move `frontend/src/service/apiClient.js` to `frontend/src/services/apiClient.js` as the shared transport module, with no behavioral edits, and update every import, including tests. The old `service/` directory temporarily remains for endpoint files until the Auth, CV, and User stages move them; remove it after it is empty and has no imports.
2. Move `emailVerificationService.js` to `frontend/src/features/auth/services/emailVerificationService.js`, because its API call belongs to auth. Keep its API request options and response behavior unchanged. Move its pure `getResendWaitSeconds` helper to `frontend/src/features/auth/utils/emailVerification.js`; update `CheckEmail.jsx` and tests.
3. Split `frontend/src/service/galleryService.js` by the resource ownership below. Preserve each method's current response extraction, error behavior, token handling, template cache key/TTL, in-flight request deduplication, and API request options:

   | Current methods | Destination |
   | --- | --- |
   | `getTemplates`, `invalidateTemplates`, `submitTemplateFeedback` | `frontend/src/features/cv/services/templateService.js` |
   | `getGalleryAssets`, `deleteCV`, `deleteJD`, `updateJD`, `getInterviewHistory`, `getInterviewAnswers` | `frontend/src/features/user/services/galleryService.js` |

   Update consumers in the root `Home.jsx`/`LandingPage.jsx`, CV pages, user pages/hooks, and `CVBuilder.jsx` to import from the owning feature service. Remove `getGalleryAssets` from `features/interview/services/interviewService.js`; update `CVStatus.jsx` to use the single user gallery implementation. The canonical gallery-assets contract is the `result` payload, with an empty list when the gallery is empty and errors propagated to the caller. Verify the backend response shape before removing the duplicate method; if its fallback to the whole response body supports a real response variant, preserve that normalization inside the one gallery implementation. Do not change endpoints or consolidate unrelated APIs into the shared root services directory.

4. Keep the existing feature API modules (`cvPipelineService`, `cvImportService`, `interviewService`, payment, admin, feedback) under their feature's `services/` directory.
5. Keep `interviewExports.js`, `localInterviewRecording.js`, and `elevenLabsService.js` under interview `services/`: these perform browser or external-system I/O.
6. Move `frontend/src/features/interview/hooks/useElevenlabsSTT.js` to `frontend/src/features/interview/services/elevenLabsTranscriptionClient.js`. It exports a client class, not a React hook. Update `InterviewRoom.jsx` and `interviewSpeechClient.test.js`; preserve the class API and runtime behavior.
7. Leave actual hooks (`useElevenLabsTTS.js`, `useInterviewSession.js`, and other `use*` hooks) in `hooks/`.

### Domain logic and pure helpers

Move these files and update all source/test imports without changing function signatures or results:

| Current path | Destination |
| --- | --- |
| `features/cv/services/analysisFlow.js` | `features/cv/domain/analysisFlow.js` |
| `features/cv/services/builderQuota.js` | `features/cv/domain/builderQuota.js` |
| `features/cv/services/editorSave.js` | `features/cv/domain/editorSave.js` |
| `features/interview/services/interviewConfiguration.js` | `features/interview/domain/interviewConfiguration.js` |
| `features/interview/services/interviewRoomStatus.js` | `features/interview/domain/interviewRoomStatus.js` |
| `features/interview/services/interviewFeedbackPresentation.js` | `features/interview/utils/interviewFeedbackPresentation.js` |
| `features/interview/services/boundedAudioChunkBuffer.js` | `features/interview/utils/boundedAudioChunkBuffer.js` |
| `features/payment/components/paymentServiceInfo.js` | `features/payment/utils/paymentServiceInfo.js` |

Retain `auth/services/authSession.js`; it coordinates auth state and is already owned by the auth feature. Do not move it merely because it is not an endpoint client.

### Mock/demo data and deletion candidates

Before deleting any candidate, perform a fresh repository-wide search covering static and dynamic imports, route references, tests, build/test configuration, and development workflows. Delete only when that audit returns no legitimate consumer.

Candidates:

- `frontend/src/App.css` — appears to be unused starter CSS.
- `frontend/src/features/cv/constants/cv-evaluation.js`, `frontend/src/features/cv/constants/cv-mock-data.js`, and `frontend/src/constants/jobDescription.js` — treat as one dependency group; `cv-evaluation.js` currently imports both data sources. Remove only if the group is disconnected from the live `/cv-evaluation` route and all tests/workflows. A route existing with a similar name is not by itself proof this fixture group is used.
- `frontend/src/features/interview/constants/companies.js` — remove only if unreferenced.
- `frontend/src/features/interview/constants/questionBank.js` — it contains unused question arrays but currently exports end-of-answer phrase arrays used by `InterviewRoom.jsx`. First move `END_PHRASES_VN` and `END_PHRASES_EN` to `frontend/src/features/interview/constants/terminalPhrases.js`, update the import, then remove `questionBank.js` only if it has no remaining consumer.
- `frontend/src/features/interview/hooks/deepgramClient.js` — appears unreferenced. Remove if the final source/config/test audit confirms there is no consumer; do not move it as if it were an active hook.

Keep `frontend/src/features/interview/constants/jobs.js`, active CV rubric/constants, and any mock fixture used by a route, test, or development workflow. The word `mock` in a filename is not sufficient reason to delete it.

## 5. Execution order

The number of implementation stages must equal the number of direct feature directories in `frontend/src/features/` when execution begins. The current repository has eight: `admin`, `analytics`, `auth`, `cv`, `feedback`, `interview`, `payment`, and `user`. Re-enumerate these directories at execution time; if the count changes, update the stage list before editing code. Do not add a separate baseline, infrastructure, global-CSS, or final-cleanup stage.

Before Stage 1, do a read-only preflight: record the feature directory list, baseline test/build state if needed, and all pre-existing Git changes. This preflight is not a stage and has no commit.

Complete exactly one feature stage at a time in this dependency-aware order:

### Stage 1 of 8 — `admin`

- Audit `features/admin/` against the ownership and CSS rules. Move `frontend/src/service/apiClient.js` to `frontend/src/services/apiClient.js`, update Admin's imports and `apiClient.test.js`, and keep a temporary re-export at the old path so later feature stages can migrate their imports one at a time. Do not update other features' imports here.
- Audit `frontend/src/App.css` as a root-level candidate; remove it only if the final reference/config check proves it unused.

### Stage 2 of 8 — `analytics`

- Audit `features/analytics/` for ownership, API-client imports, CSS ownership, and unused files. Change only analytics-owned code plus directly required shared integration files.
- If it already meets the target, make no code change and report the evidence.

### Stage 3 of 8 — `auth`

- Move email verification API logic to `features/auth/services/` and `getResendWaitSeconds` to `features/auth/utils/`; update auth imports/tests and use the canonical shared API client.
- Keep `authSession.js` in place.

### Stage 4 of 8 — `user`

- Move gallery assets, saved CV/JD actions, and interview history/answers to `features/user/services/galleryService.js`; migrate user pages/hooks.
- Keep a temporary root compatibility facade only for consumers that have not reached their stage. Migrated user-gallery methods must delegate to the User service; template methods may remain there until the CV stage. Do not duplicate moved endpoint implementations.

### Stage 5 of 8 — `cv`

- Move CV pure workflows to `features/cv/domain/` and template catalog/cache/feedback calls to `features/cv/services/templateService.js`.
- Update CV pages and root `Home.jsx`/`LandingPage.jsx`; migrate `CVBuilder.jsx` to the user gallery service.
- Audit and remove the CV demo dependency group only if the final zero-consumer check passes.
- Classify CV-owned selectors in `index.css`; create `features/cv/cv.css` only if shared CV page rules justify it. Keep PDF renderer CSS isolated.

### Stage 6 of 8 — `feedback`

- Audit `features/feedback/` and migrate its shared API-client import if needed.
- Move feedback-widget rules out of `index.css` into the one feedback feature stylesheet if they are feature-owned; preserve global utilities that have consumers across features.
- If the feature already meets these requirements, make no code change and report the evidence.

### Stage 7 of 8 — `interview`

- Move interview rules/helpers to `domain/` or `utils/`; move the ElevenLabs transcription client from `hooks/` to `services/`.
- Extract active terminal phrases before deleting `questionBank.js`; remove `companies.js` or `deepgramClient.js` only after zero-consumer checks.
- Migrate `CVStatus.jsx` to the user gallery service and remove the duplicate `/gallery/assets` API implementation from `interviewService.js`.
- Consolidate interview styles into `features/interview/interview.css`, move interview-only selectors out of `index.css`, and remove old page stylesheets after import checks.

### Stage 8 of 8 — `payment`

- Move `paymentServiceInfo.js` from `components/` to `features/payment/utils/`; update its imports and tests.
- Migrate payment's shared API-client import. After all features have migrated, remove temporary shared-client/gallery compatibility files and the old root `service/` directory only when they have no remaining consumers.
- Finish the global stylesheet ownership audit without creating another stage; retain only genuinely global styles in `index.css`.

### Gate and handoff after each feature

1. Audit the whole current feature and the exact consumer paths required by its changes. Make changes only if requirements are unmet. Any cross-feature file changed must be a direct consumer needed to complete the current feature's ownership migration; include it in that stage's report.
2. If no changes are needed, report the feature as compliant with file/reference evidence. Do not create an empty commit.
3. If changes are needed, run the affected tests, full `npm test`, `npm run build`, `git diff --check`, and any specified visual review. Stage only current-stage changes; preserve unrelated edits, including unrelated hunks in a file that must be touched.
4. Create one commit for the current feature stage using a project prefix such as `[REFACTOR]` and an imperative summary. Inspect it with `git show --check --stat --oneline HEAD` and verify the file list and workspace status.
5. Report the audit/changes, checks, and commit hash (if a commit was needed), then stop and wait for the user's explicit confirmation before starting the next feature. Apply this wait after a compliant/no-change report too. If a check or commit review fails, remain on the current feature until fixed and re-verified.

Do not combine this work with visual redesign, API contract changes, routing changes, state-management rewrites, or unrelated backend/user edits.
## 6. Acceptance criteria

The refactor is complete when all of the following are true:

- There is one shared global stylesheet, `frontend/src/index.css`, and no more than one shared stylesheet per feature; page-only utility/inline styles remain alongside page JSX.
- Interview shared styles live in `features/interview/interview.css`; old interview CSS files have no remaining import and are removed.
- PDF-renderer inline CSS remains self-contained and unchanged in output.
- Shared root `services/` contains only shared transport infrastructure; endpoint clients live with their owning feature.
- All React hooks remain in `hooks/`; the ElevenLabs transcription client is no longer classified as a hook; pure helpers are not mislabeled as API services or UI components.
- Template endpoints/cache and user-gallery endpoints each have one implementation; no duplicate `/gallery/assets` client remains in interview service.
- Every removed data/style/client file passed the final zero-consumer audit; active constants, data, fixtures, routes, and behavior remain intact.
- Routes, copy, API endpoints/payloads, loading/error behavior, visual states, and exported PDFs are unchanged.
- There is exactly one stage per direct feature directory at execution time; no separate infrastructure or cleanup stage is added.
- The next feature does not begin until the current feature has been reported and the user confirms continuation, including when the feature needed no changes.
- Every changed feature stage has its own verified commit. A compliant feature is reported without an empty commit.
- No unrelated user changes are reverted, staged, or included in the refactor.

## 7. Verification after implementation

Run from `frontend/`:

```text
npm test
npm run build
```

Update imports in existing tests for moved modules, including `apiClient.test.js`, `emailVerificationService.test.js`, `paymentServiceInfo.test.js`, `analysisFlow.test.js`, `builderQuota.test.js`, `editorSave.test.js`, `interviewConfiguration.test.js`, `interviewFeedbackPresentation.test.js`, `interviewRoomStatus.test.js`, and `interviewSpeechClient.test.js`. Preserve their current assertions; do not weaken tests to accommodate the refactor.

Visually compare interview setup and result/report screens, CV editor and preview, and CV PDF export. Check responsive layout, focus/hover/disabled states, print output, and shared/global style leakage. Finish with `git diff --check`, a stale-import search, and `git status --short` to confirm unrelated workspace changes are preserved.

## 8. Out of scope

- Changing the design system, page layouts, colors, copy, or product behavior.
- Reworking backend files, APIs, data contracts, or app routing.
- Deleting fixtures or constants based only on their names.
- Creating per-page CSS files or promoting one-off page classes to global CSS.
- Staging, committing, or reverting unrelated work; commits are limited to the current verified stage.
