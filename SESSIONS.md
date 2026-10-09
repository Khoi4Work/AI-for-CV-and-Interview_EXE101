# Session History

## 2026-10-09 — Verify and group current work for done

- Review current changes and group CV evaluation/recommendations, personal JD management, and approved planning documentation into separate commits.
- Fix fallback JD ranking to ignore common conjunctions and trailing sentence dots; use neutral IT metadata in regression fixtures so content-based BA matching is tested accurately.
- Validation: all 32 frontend tests, frontend production build, targeted ESLint, and both JDRecommendationServiceImpl backend tests passed. Run the focused backend suite with the local Byte Buddy premain agent and no fork outside the sandbox because Windows attach IPC and sandbox loopback restrictions prevented normal execution.
- The frontend build retains its existing large-chunk warning. The new 20-task implementation plan remains future work; no migration or database operation was executed.

## 2026-10-09 — Write the approved CV evaluation implementation plan

- Convert the accepted CV–JD trust/evidence spec into 20 executable tasks (T00–T19), with dependencies, file targets, meaningful tests and completion gates G0–G7.
- Include model/schema groundwork, manual migrations, role filtering, evidence/scoring, cache/idempotency/quota, bounded jobs, API adapters, result UI, alternative-role evaluations, JD provenance, real CV evidence updates, calibration and a later Interview audit.
- Link the current plan from the accepted spec and historical implementation plan. Preserve existing uncommitted implementation work and the user's current two-JD/no-85%-threshold decisions.
- Validation: documentation structure, links and `git diff --check`; this request adds planning documentation, not runtime implementation or database execution.

## 2026-10-09 — Plan trusted CV evaluation and evidence

- Record the user's demo feedback and latest decisions in a detailed Vietnamese spec; link it as the current specification from the historical CV evaluation design.
- Clarify that the former 60/100 was Cohere relevance. Searching/selecting JDs produces no displayed evaluation score; the start-evaluation action produces or reuses one authoritative scored analysis with evidence.
- Plan explicit-role import/filtering, versioned input snapshots, deterministic rubric calculation from validated evidence, server-owned alternative-score comparisons, quota/cache behavior, readable JD rendering, and a later Interview configuration/context audit.
- Preserve the two-JD limit, removal of the 85% threshold, and the absence of a pre-search target-role form/confirmation. Mark rubric baseline weights as a proposal to calibrate, rather than an already approved formula.
- Validation: documentation links and Markdown structure reviewed; implementation and database changes were not performed for this planning request.

## 2026-10-08 — Refine CV input, JD selection, and evaluation flow

- Record the approved UX plan in the CV evaluation design spec and update the JD recommendation spec to distinguish JD relevance from evaluated CV–JD fit.
- Replace the blocking CV-existence modal with upload/create paths; carry the return-to-evaluation route through template selection and CV save.
- Validate PDF/DOC/DOCX and the 5 MB limit at selection/drop time; make the evaluation progress indeterminate and truthful.
- Confirm the CV target role before searching, or derive up to three role suggestions from the CV and require user selection. Search at most two JDs for the confirmed role.
- Add full JD previews and explicit selection; expose full alternative JD content and an action to evaluate it using the imported CV.
- Label the result as a CV–JD evaluation score; keep alternative suggestions filtered by the same evaluation operation and current score.
- Validation: frontend production build, all 32 frontend tests, targeted ESLint on changed frontend files, and backend Maven compile passed. Full-project ESLint still reports unrelated existing errors; build reports the existing large-bundle warning.

## 2026-10-09 — Simplify CV-to-JD discovery

- Remove the target-role text field and pre-search confirmation. Find up to two JDs immediately after CV import.
- When `professionalTitle` exists, search/rank against the full JD document, including `content`, so generic database titles such as “User Provided JD” do not hide a matching role. Support BA / Business Analyst / Phân tích nghiệp vụ aliases.
- When the CV has no explicit role, rank JDs from CV skills, experience, summary, and projects, then explain this basis so the user can choose a JD.
- Remove the “Chưa có CV?” notice and its prominent creation CTA from the evaluation page.
- Validation: frontend build, 32 frontend tests, targeted ESLint, backend main compile, and test-source compilation passed. The focused backend test runner did not finish after the JVM emitted a Byte Buddy self-attach pipe error; no test result was produced. Build retains the existing large-chunk warning.

## 2026-10-09 — Extract and manage saved JD titles

- Extract a role title from the JD body when saving custom JDs; replace the generic stored title and backfill legacy generic titles when opening the JD library.
- Add a “JD của tôi” page with title, company, content preview, and a confirmed hide action.
- Implement removal as a soft delete using the existing `active` flag. Hidden JDs leave new recommendations and personal lists while historical CV evaluations/interviews keep their foreign-key references; intentionally re-submitting identical JD text restores it.
- Validation: frontend production build, all 32 frontend tests, targeted ESLint for the new JD library and supporting files, backend test-source compilation, and `git diff --check` passed. The build reports the existing large-bundle warning.
- Follow-up UX: replace two-column inline JD expansion with a single-column list and one detail modal at a time; keep full JD text in a dedicated scrollable reading area. Frontend build, all 32 tests, and page ESLint passed.
- Follow-up editing: allow editing the JD title, company, and full content in a dedicated form; recalculate normalized content hashes and prevent duplicate JDs in the same gallery. Frontend build, all 32 tests, targeted ESLint, backend test-source compilation, and `git diff --check` passed.
- Structured-content editing: render JSON-backed JD content as readable Vietnamese sections in the editor and populate empty title/company fields from its metadata. Frontend build, all 32 tests, page ESLint, and `git diff --check` passed.

## 2026-10-08 — Add curated FPT IT job descriptions

- Add an idempotent manual SQL seed with five IT-only FPT Telecom and FPT Play JD summaries, including source links and experience levels.
- Keep all records in the shared SYSTEM catalog and identify the source posting and reference date in each summary.
- Validation: checked the five seed records in H2 for required fields, unique catalog keys, IT industries, source links, and SYSTEM scope. The SQL has not been run against the configured database.

## 2026-10-08 — Enable the free Interview trial

- Grant new Free accounts five one-time interview minutes and provide a manual migration for existing Free accounts.
- Allow basic interview feedback and saved feedback access for Free accounts while keeping enhanced criteria and recommendations restricted.
- Update pricing benefits and the practice button; remove the lifetime price suffix.
- Align pending-account cleanup with the new default quota.
- Validation: frontend production build and four targeted Interview tests passed; `git diff --check` passed. Full backend tests failed during context initialization because the test environment lacks an AI API key. Database migrations were not executed.

## 2026-10-07 — Wait for interview question audio before listening

- Removed the fixed 15-second transition from asking to recording, which could enable the candidate microphone while longer TTS questions were still playing.
- Kept the post-answer transition delay in a dedicated processing timer and clear it on unmount.
- Validation: frontend production build succeeded; `git diff --check` passed.

## 2026-10-07 — Interview voice/export, token refresh, and service layering

- Added scripted interview voice transitions with expression-tag and generated-script logging; moved Vietnamese speech phrases to UTF-8 YAML configuration.
- Added interview transcript/audio downloads, local mixed audio capture, audio test guidance, and printable interview reports.
- Fixed the refresh endpoint access rule and enforced access-versus-refresh JWT types while allowing still-valid legacy refresh tokens.
- Refactored service contracts into interfaces with implementations under `service/impl`, and moved jobs, policies, security adapters, and exceptions into focused packages.
- Validation: backend Maven compile succeeded; tests were not run.

## 2026-10-03 — DeepSeek and Gemini chat provider integration

- Added DeepSeek as the default chat provider and Gemini as the fallback for CV and interview AI operations.
- Added named chat clients and a shared completion router to avoid ambiguous Spring bean injection.
- Kept Gemini as the primary embedding model for pgvector after the OpenAI starter introduced another embedding bean.
- Qualified ElevenLabs TTS injection after the OpenAI starter introduced another speech model bean.
- Renamed the CV and interview provider implementations so their names no longer imply Gemini-only behavior.
- Added configured model names to AI request, fallback, and failure logs to identify quota errors by model.
- Added Gemini fallback when DeepSeek reports an exhausted balance (HTTP 402 / insufficient balance).
- Added CV result notices that identify MIDDLE for detailed evaluation and ENHANCE for automatic optimization.
- Validation: `git diff --check` passed. Build and tests were not run.
