# Session History

## 2026-10-14 — Secure CV optimization results, template access, and session expiry

- Recalculate the proposed CV score with the existing CV/JD rubric; ignore AI-predicted scores, clear stale parser text before scoring, and keep the proposal in an optimization-job snapshot until the user explicitly saves it. Scope result polling to the CV owner's gallery and document the required manual migration.
- Resolve preview templates from the server catalog and the signed-in user's plan, unlock all catalog tiers for Enhance, and display readable CV section labels instead of JSON paths.
- Keep anonymous catalog access when no Bearer token is sent, but return 401 for invalid, expired, disabled-account, or removed-account credentials. Let the frontend refresh a valid session and return the user to the requested route after re-login.
- Remove the visible preview-update badge from the CV page while retaining its screen-reader status.
- Validation: focused Maven CV optimization tests passed; `AccountAuthenticationStatusTest` passed (9 tests); frontend targeted ESLint and `git diff --check` passed. Full frontend test setup remains limited by the workspace's protected `.env` file. Apply `20261014_cv_optimization_result_snapshot.sql` manually before deploying the optimization snapshot change.

## 2026-10-14 — Unify CV PDF export and empty-section rendering

- Replaced browser HTML/CSS export with a client-side React PDF renderer shared by all six CV templates, preserving template-specific layouts and styling.
- Added canonical CV data mapping and visibility helpers so empty or whitespace-only sections are omitted without inferring links between independent projects and work experience.
- Propagated the empty-content behavior to the JSX previews, filtered blank skill entries, and added renderer/mapping regression tests.
- Validation: frontend production build, 52 frontend tests, targeted ESLint for changed template and skill-list files, and `git diff --check` passed. Full frontend lint still reports existing errors in unrelated files; PDF visual comparison remains a manual check.

## 2026-10-14 — Use the PDF renderer for all CV previews

- Replaced JSX template rendering in the CV editor, optimization result, and saved-CV preview with the same PDF renderer used for downloads.
- Moved editing controls into a structured content panel so personal details, summary, experience, education, projects, skills, certificates, languages, and awards continue to update the live PDF preview; profile photo selection remains available in the toolbar.
- Removed the retired JSX template components and their template-only view mapper to keep the PDF renderer as the single template source.
- Validation: frontend production build, all 49 frontend tests, and targeted ESLint passed. The build reports the large-client-chunk advisory; in-browser visual QA is still needed.

## 2026-10-14 — Pull and inspect teammate updates
- Fetched origin and fast-forwarded dev from 2d937cc to 9d9c69d (15 incoming commits by NguyenKhoi).
- Pull autostash conflicted only in SESSIONS.md; retained upstream and local session entries, resolved the conflict and left notes unstaged. Autostash remains available for recovery.
- Reviewed incoming changes: evidence-based CV/JD analysis, interview configuration/context fixes, free CV import quota behavior, shared searchable PDF rendering/editing/previews, JD formatting and manual database migration/profile organization.
- Verified HEAD matches origin/dev and no unresolved Git conflicts remain. Did not execute DB migrations or run application tests. frontend/package-lock.json acquired a local change during inspection and was preserved.

## 2026-10-14 — Hide template rating action
- Commented the template card rating button, its handler and callback prop binding to hide both Rate template and locked-plan rating actions on /templates.
- Verification: TemplateCard ESLint and production build passed; build required elevation after sandbox EPERM reading a PDF dependency asset. git diff --check passed.
- Changes remain uncommitted; existing package-lock and session edits were preserved.

## 2026-10-14 — Block locked template detail navigation
- Added the catalog locked flag check to openTemplate so the quick-preview detail action closes the preview and opens the existing upgrade modal instead of navigating to a locked template.
- Guest login redirection and unlocked template navigation remain intact.
- Verification: production frontend build and git diff --check passed. Changes remain uncommitted; existing edits preserved.

## 2026-10-14 — Diagnose payment history failure
- Confirmed attached PostgreSQL log reports SQLState 42703: orders.is_test is missing during the payment history entity query.
- Order now maps is_test, paid_at and refunded_at; required manual admin reporting migration adds these columns. ddl-auto=none does not apply it automatically.
- Provided the current db/migrations script path and column verification query. No database changes or application code changes executed.

## 2026-10-14 — Diagnose admin routing to user pages
- Login.jsx prioritizes location.state.from.pathname over the ADMIN destination for both email and Google login.
- AppLayout redirects authenticated visits to / to /home regardless of role; Register Google login also defaults to /home without role handling.
- ProtectedRoute only checks authentication, so admin accounts can open user routes. Backend authentication responses and /auth/me expose the database role.
- Code inspection only; live auth responses and DB role were not inspected and no routing code changed. Existing uncommitted edits were preserved.

## 2026-10-14 — Admin login routing and view switch
- Centralized post-login destination so ADMIN overrides a saved user return page for email/Google login and Google sign-in through Register. Root entry routes signed-in ADMIN to /admin.
- Added role-gated Quản trị links to public/user headers and a Trang người dùng link on admin pages. Explicit website home/logo links use /home to preserve the chosen user view.
- Verification: all 52 frontend tests and production build passed; auth/admin changed-file lint passed. Additional header lint reports three pre-existing issues (set-state-in-effect and unused React); left unrelated behavior unchanged.
- No backend/DB role changes. Existing uncommitted edits retained; implementation remains uncommitted.

## 2026-10-14 — Explain successful payment persistence
- Verified checkout stores an orders record; authenticated PayOS webhook updates PAID/COMPLETED/paid_at and grants credits/minutes in user_usage_quotas within a transaction.
- History reads orders by account_id. Duplicate settled/refunded webhooks are skipped. Read-only code inspection; no DB mutations.

## 2026-10-14 — Inspect payment log usage
- Searched source/tests and confirmed PaymentLog exists only as a mapped entity; no repository or service reads/writes payment_logs in the current implementation.
- Explained optional transaction event audit purpose separately from orders-based payment history. No application or DB changes.

## 2026-10-14 — Implement payment event persistence
- Added PaymentLogRepository and transaction-bound event writes for CHECKOUT_CREATED, PAYMENT_SUCCEEDED, PAYMENT_FAILED and WEBHOOK_IGNORED. Duplicate settled/refunded webhook events do not grant quota again.
- Kept selected reconciliation fields only; omitted signatures, checkout URLs, bank account names/numbers and unexpected payload fields. Invalid signatures and unknown orders remain server diagnostics without trusted order events.
- Added repeatable manual PostgreSQL migration 20261014_payment_logs.sql for the existing entity schema/index and documented event behavior/query in db/README.md. No fabricated historical events or live DB changes.
- Verification: 15 selected backend tests passed on Java 21, including JSON event persistence, mocked checkout, duplicate webhook, invalid-signature rejection, payment failure and transactional rollback; git diff --check passed. A test import ambiguity was corrected before passing runs.
- Existing frontend, SQL account-promotion and package-lock edits preserved. Changes remain uncommitted/unpushed.

## 2026-10-14 — Centralize verified authentication and permission routing
- Replaced cached-profile authentication with a shared, verified /auth/me session state: checking/authenticated/guest/error. Deduplicated verification and ignored late responses after logout or replacement; retry keeps credentials on network/403/server failures.
- Login and Google Register wait for verified profile role before routing. Non-admin return destinations cannot enter /admin. AdminRoute uses verified context without a second identity request, redirects members home with one informational toast and never signs them out for lack of admin permission.
- Added shared refresh handling: one refresh for concurrent 401s, no hard navigation, context expiration event only after definitive token rejection (including backend INVALID_INPUT 4002). Network/500/normal 403 preserve session. Late unauthorized responses do not clear newer credentials.
- Verification: all 66 frontend tests passed, focused lint and production build passed; no live Google authentication or DB changes executed. Initial refresh tests used a separate Axios instance; corrected test adapters to use the application's refresh client.
- Preserved all earlier pending work. Changes remain uncommitted/unpushed.

## 2026-10-14 — Simplify role navigation and restore logout loading
- Changed all successful sign-ins/root entry to /home, removed automatic role destination helper/tests, and limited the admin entry link to the home header for verified ADMIN. Kept guarded /admin access and return-to-user-home action.
- Restored login page loading during profile verification instead of replacing it with bootstrap loading.
- Added a global logout overlay independent of route changes, blocked background interaction, deduplicated logout clicks and kept feedback visible for at least 400 ms. Token revocation has a 5-second timeout; local logout completes even offline.
- Removed unused auth context exports, extra user-header admin entry and dead Home logout/header-prop wiring. Retained useful verified session/refresh safeguards.
- Verification: 65 frontend tests passed, production build and focused auth lint passed; git diff --check passed. Changes remain uncommitted/unpushed; all prior unrelated edits preserved.

## 2026-10-14 — Match logout loading to login loading
- Matched LogoutLoading card styling, spacing, spinner and security footer to the current LoginLoading component while retaining logout-specific text and its global overlay stacking order.
- Preserved the user's current card width/corner classes. Focused ESLint passed; application changes remain uncommitted.

## 2026-10-14 — Remove intermediate logout redirects
- Found independent logout navigation in public header, user header, sidebar and admin header. Sidebar navigated to protected /home after clearing the session, triggering /login.
- Centralized navigation in AuthProvider to public / with replace before invalidating authentication, and render only the logout overlay while revocation runs so child guards cannot redirect.
- Removed all post-logout navigation from consumers and the now-unused user-header navigate import. Final visible flow is logout loading then guest landing.
- Verification: all 65 frontend tests, production build, focused AuthProvider/AdminArea lint and git diff --check passed. Changes remain uncommitted/unpushed.

## 2026-10-14 — Smooth logout feedback and remove blank transition
- Extended minimum logout feedback to two seconds. Keep the current authenticated view/profile behind an inert overlay while immediately removing stored credentials; navigate once to guest landing when logout completes.
- Added skipEnter to PageTransition for the logged-out landing only, avoiding the initial opacity-zero frame after hiding the overlay.
- Verification: all 65 frontend tests passed, including minimum feedback duration and one completion transition; production build, focused ESLint and git diff --check passed. Changes remain uncommitted/unpushed.

## 2026-10-14 — Diagnose duplicate pending checkout entries
- User logs prove two distinct CHECKOUT_CREATED orders about two seconds apart, followed by one PAYMENT_SUCCEEDED event for the first order. Payment history is displaying separate orders, not duplicate paid rows.
- PaymentPage has no in-flight guard/loading flag and OrderSummary does not disable during checkout; backend creates a new order on every checkout request without idempotency/reuse.
- Identified repeated clicks/retry as possible triggers; actual originating browser requests were not captured. No code/DB changes made for this diagnosis.

## 2026-10-14 — Improve expanded payment history readability
- Enabled the solid-white Modal variant only for payment history, removing translucent background/text contrast problems.
- Added separate bordered transaction cards with clear amounts, status badges, date icons and copyable order IDs. Improved status filter contrast, selected/keyboard states and load-more presentation.
- Kept compact pricing preview and API/filter behavior unchanged. Verification: PaymentHistory ESLint, production build and git diff --check passed. No live browser visual check; changes remain uncommitted/unpushed.

## 2026-10-14 — Remove refunded payment history filter
- Removed the REFUNDED filter button from expanded pricing payment history. Existing order status labels and data remain accurate under All.
- Verification: focused PaymentHistory ESLint passed. Changes remain uncommitted.

## 2026-10-14 — Display highest plan in account header
- Changed user header badge to compare verified profile membershipType (CV) and interviewMembershipType using FREE < MIDDLE < ENHANCE. CV Middle plus Interview Enhance now displays Enhance.
- Kept per-service profile fields and quota/entitlement checks unchanged; added a descriptive badge tooltip.
- Verification: two focused tier-label tests, helper/test ESLint and production frontend build passed; git diff --check passed. Changes remain uncommitted/unpushed.

## 2026-10-14 — Commit and push all requested application changes
- Pulled 2b59577 from origin/dev without conflicts, then reviewed and grouped all application changes into six commits: f4ae8a6 payment event logs, 88f3faf authentication/navigation and tier badge, 1c4c306 template actions, d395f0f payment history UI, 5202f6e designated admin promotion script, de842fa npm lock metadata.
- Final validation: all 67 frontend tests and 15 selected backend tests passed; existing latest frontend production build passed; staged diff checks passed before every commit.
- Pushed all six commits to origin/dev ending at de842fa. Session records remained local per standing user preference; no stash/revert was requested or performed. No DB migration executed.

## 2026-10-14 — Synchronize session history for version control

- User explicitly authorized committing and pushing session records, superseding the earlier local-only preference.
- Consolidated current notes and missing sections from six saved stashes without applying source-code snapshots or deleting stashes. Deduplicated section headings and bullet entries, and sorted by date.
- Prior application work is pushed through de842fa; latest verification is 67 frontend tests, 15 selected backend tests and a passing frontend production build. Manual production database migrations remain the deployment operator's responsibility.
- Validation: verified preserved source headings, no merge markers, and a session-only staged diff before commit.

## 2026-10-13 — Finish CV import, template, evaluation and PDF work

- Separate file import from CV-creation quota consumption; assign the existing per-CV analysis allowance from the user's plan and keep Enhance optimization from consuming analysis quota.
- Preserve source-provided skill categories in all CV templates, keep languages out of the skills list, and allow users to resize editable CV text fields.
- Correct alternative-JD failure counts and preserve the selected JD when returning to evaluation after adding CV evidence.
- Replace device print-to-PDF with a server-side Chromium export that renders the selected template HTML/CSS and verifies extractable text with Apache Tika. Install/configure Chromium in the backend Docker runtime; PDF export does not consume CV quotas.
- Set production Hibernate DDL mode explicitly to `none`.
- Validation: 46 frontend tests and the frontend production build passed. Backend Maven packaging could not be verified because Maven could not open its local repository lock in the sandbox. A Chromium PDF smoke test and deployment runtime validation remain unverified; no database operation was run.

## 2026-10-10 — Diagnose and unblock pulling dev
- Confirmed SSH fetch succeeds and dev was seven commits behind origin/dev. A fast-forward pull failed because tracked SESSIONS.md had local edits hidden by skip-worktree while the remote also changed it.
- Removed skip-worktree, preserved only local session edits in a named stash, then successfully pulled all seven commits to df1c3d7. No source conflicts or source edits were needed; HEAD and origin/dev are synchronized.
- Session-only diagnostic notes are also saved in a separate named stash to leave the working tree clean, respecting the user's preference not to show session changes. Did not reapply skip-worktree; permanent repository-wide ignoring would require untracking this file with a subsequent agreed Git change.

## 2026-10-10 — Audit and plan basic admin area
- Confirmed frontend has no admin routes/pages, AccountRole only defines ATTENDANCE/PARTNER, and payment history is scoped to the authenticated account. Existing Spring method security and DB-loaded ROLE authorities can support ADMIN access.
- Plan a read-only admin dashboard, paginated users/details, and global payment list/statistics backed by a modules/admin layer and dedicated DTOs. Add ADMIN with guards on /api/admin/** and frontend AdminRoute; whitelist public registration/invitation roles to prevent self-promotion and provision an initial admin only through an explicit trusted setup.
- Statistics require explicit paidAt/refundedAt and exclusion of tagged test orders. Current Order has orderedAt/status/amount but no successful-payment timestamp; do not represent order creation dates as settlement dates or infer unknown historical payment times. Aggregate in DB with documented date ranges, statuses and VND amounts.
- Implementation order: role/security/migrations, user APIs, payment aggregates, admin UI, access/aggregation/pagination tests under existing frontend/tests and backend/tests. No feature code implemented; existing local TemplateList.jsx edits remain untouched.

## 2026-10-10 — Admin users and payment reporting
- Added ADMIN-only user/payment list, detail, filters and daily/service reporting APIs and frontend pages under /admin.
- Rejected public registration and invitation attempts to create ADMIN; supplied a single-admin PostgreSQL migration and optional ACTIVE account promotion script.
- Added explicitly enabled admin-demo profile with BCrypt-protected admin/admin alias, existing-account preservation, and no default bootstrap.
- Recorded first successful PayOS settlement time, preserved refunded orders on duplicate webhooks, excluded test payments, and exposed legacy undated amounts separately.
- Matched admin quota details to current non-expiring Free/Middle/Enhance credit fields. Added setup instructions in docs/admin-setup.md.
- Verification: 20 selected backend tests passed on Java 21; all 35 frontend tests passed; production build and focused ESLint passed; git diff --check passed.
- Manual PostgreSQL migration, real DB demo provisioning and live browser login have not been executed. Preserved pre-existing TemplateList.jsx edits. App changes remain uncommitted.

## 2026-10-10 — Remove demo admin credentials
- Removed demo admin bootstrap/profile, username alias and unused account count method; restored email-only login input while keeping ADMIN redirects and access control.
- Replaced demo-only tests with real-email admin authentication and invitation protection checks; updated deployment setup documentation.
- Verification: Maven clean test passed all 13 selected backend tests on Java 21; frontend production build and Login ESLint passed; no demo references remain in source/tests; git diff --check passed.
- No production database accounts were deleted or modified. Admin and pre-existing TemplateList edits remain uncommitted.

## 2026-10-10 — Commit and push admin implementation
- Used source-command-commit workflow, staged only admin/reporting changes and preserved pre-existing TemplateList.jsx changes outside the commit.
- Fetched origin and verified dev was synchronized before committing. Staged diff check passed.
- Created and pushed 4bed62d [FEAT] Add admin user and payment reporting to origin/dev. No demo credentials included.

## 2026-10-10 — Push TemplateList change
- Committed only the requested TemplateList.jsx change hiding the CV template upload button; session notes remained local.
- Validation: scoped diff check passed; prior frontend production build included this unchanged edit and passed.
- Pushed the dedicated UI commit to origin/dev.

## 2026-10-10 — Align CV analysis code with project conventions

- Move analysis status, quota status, requirement group and assessment enums from the DTO container into `modules/cv/entity/enums`; DTO records now reference those shared enum types.
- Replace `var` in the new CV analysis/normalization path with explicit types. Inject `RoleTaxonomyService` through its interface in the CV pipeline, parser and JD recommendation service instead of constructing the implementation directly.
- Document the purpose of CV analysis configuration and the typed validation exception. Keep module exceptions as `ApiException` subtypes because the worker must distinguish insufficient evidence and an in-progress JD extraction from provider/system failures; both still use the shared global HTTP handler when surfaced.
- Clarify that no database table stores these Java enums: JPA stores enum names as strings. The three SQL-created tables persist analysis snapshots/results, idempotency requests, and alternative-job queue state; they are workflow storage, not enum storage.
- Validation: static reference checks and `git diff --check`; no tests/build or DB operations run for this correction.

## 2026-10-10 — Simplify CV analysis database ownership

- Merge per-analysis quota lifecycle into `cv_analyses.quota_status`; keep the existing quota module as the source of allowances, with locked once-only consumption/refunds and no charge for internal alternative analyses.
- Store normalization metadata, input hash/version and requirement extraction lease/token on `job_descriptions`; remove the separate entity/repository. Keep provider calls outside locks and prevent old snapshot or late AI responses from replacing an edited JD cache.
- Store culture source URL, reference date and verification flag on `company_info`; remove the separate verification entity/repository. Preserve verified-source requirements for interview context.
- Keep only three new tables: analyses, idempotency requests and alternative jobs. Update manual SQL/readiness/spec/plan/checklist; copy earlier side-table data only when first adding the owner column and retain legacy tables for review.
- Validation: 55 focused backend mock unit tests passed (zero failures/errors), including quota lifecycle and JD edit fencing; all test sources compiled. Initial sandbox run encountered Java loopback restrictions, then the same suite passed outside sandbox. `git diff --check` passed. No SQL, DB tests, automatic migration, commit or deployment was performed. Apply the revised SQL before running this application version, even with CV analysis disabled.

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

## 2026-10-09 — Implement trusted CV/JD analysis and interview configuration

- Implement a versioned backend analysis contract with immutable CV/JD snapshots, exact evidence checks, cached JD requirements and deterministic rubric-v1 scoring (40/35/10/15, mandatory/preferred weights, N/A groups and final rounding). Search relevance remains separate from evaluation scores.
- Add owner-scoped cache/idempotency requests, quota charge lifecycle/refunds, persistent bounded analysis and alternative-role queues with leases/attempt fencing. Compare at most five candidate JDs using the same scoring service and show at most two higher-scoring different roles.
- Preserve explicit versus historical CV roles; normalize generic JD titles from actual content, filter occupation before reranking, and provide opt-in metadata backfill without AI calls or new JDs.
- Connect frontend import/select/start/poll/results to analysis IDs; provide one solid viewer for CV/JD/evidence, bounded skill lists, readable mobile score layout, bottom alternative cards with full-JD viewing and real CV editing for new evidence. Remove real-path mock fallback and client-supplied baseline scoring.
- Fix interview configuration normalization and stale session reuse, persist question type/source/context, distinguish HR/STAR/Technical prompts and resolve company culture only with verified provenance. Personalized generated questions/audio use session snapshots instead of writing private CV data into the shared question bank.
- Follow the user's import/exception correction: explicit imports in new production classes; CVAnalysisValidationException and JobDescriptionRequirementsPendingException extend the project ApiException. Worker distinguishes expected evidence failures from unexpected runtime/provider errors; service lookups use ErrorCode rather than generic missing-value exceptions.
- Provide two manual SQL artifacts and a DB/acceptance checklist. SQL was not applied to the configured DB. After the user requested to handle DB tests themselves, no additional DB test or database operation was run. Keep CV_ANALYSIS_ENABLED=false until the user applies and verifies the schema.
- Validation: 49 focused backend unit tests passed using mocked repositories/providers (no DB), 40 frontend tests passed, production build and targeted ESLint passed. Browser checks used an explicitly labeled synthetic fixture for one viewer, full-JD content, skill-list scrolling and 390px layout; this is not a live provider/DB end-to-end test. Existing frontend large-chunk warning remains.
- Earlier broad regression attempted before the user's DB-test instruction exposed pre-existing auth/repository fixture errors; do not claim the full backend integration suite passed. PostgreSQL migration/concurrency checks, representative human calibration and real-provider interview acceptance remain pending. No commit or deployment was performed.

## 2026-10-08 — Refine CV input, JD selection, and evaluation flow

- Record the approved UX plan in the CV evaluation design spec and update the JD recommendation spec to distinguish JD relevance from evaluated CV–JD fit.
- Replace the blocking CV-existence modal with upload/create paths; carry the return-to-evaluation route through template selection and CV save.
- Validate PDF/DOC/DOCX and the 5 MB limit at selection/drop time; make the evaluation progress indeterminate and truthful.
- Confirm the CV target role before searching, or derive up to three role suggestions from the CV and require user selection. Search at most two JDs for the confirmed role.
- Add full JD previews and explicit selection; expose full alternative JD content and an action to evaluate it using the imported CV.
- Label the result as a CV–JD evaluation score; keep alternative suggestions filtered by the same evaluation operation and current score.
- Validation: frontend production build, all 32 frontend tests, targeted ESLint on changed frontend files, and backend Maven compile passed. Full-project ESLint still reports unrelated existing errors; build reports the existing large-bundle warning.

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

## 2026-10-07 — Interview voice/export, token refresh, and service layering

- Added scripted interview voice transitions with expression-tag and generated-script logging; moved Vietnamese speech phrases to UTF-8 YAML configuration.
- Added interview transcript/audio downloads, local mixed audio capture, audio test guidance, and printable interview reports.
- Fixed the refresh endpoint access rule and enforced access-versus-refresh JWT types while allowing still-valid legacy refresh tokens.
- Refactored service contracts into interfaces with implementations under `service/impl`, and moved jobs, policies, security adapters, and exceptions into focused packages.
- Validation: backend Maven compile succeeded; tests were not run.

## 2026-10-07 — Pull teammate updates into dev
- Fetched origin and fast-forwarded dev from af2e7da to 4d3ae94 (9 commits, 95 files). Updates cover non-expiring quotas, JD recommendations, service interfaces, scripted interview voice/local exports and access/refresh token separation.
- Preserved local SESSIONS.md changes via temporary stash, restored successfully without conflicts, and retained the prior skip-worktree preference. No application changes or commits made locally.
- Verification: frontend production build passed with bundle-size advisory; 31/32 frontend tests passed. paymentServiceInfo.test.js still expects monthly duration/quota labels while updated code returns non-expiring packages. Backend tests and database migrations were not run.

## 2026-10-07 — Hide unimplemented combo packages
- Confirmed PricingPage combo buttons only show informational toasts; backend checkout grants either CV or INTERVIEW and has no combo category/catalog products.
- Commented out the full combo section pending backend integration and removed the unused Gift import. Preserved pre-existing PricingPage and backend test edits.
- Verification: targeted ESLint and frontend production build passed (existing bundle-size advisory). No commit or push; application changes remain uncommitted.

## 2026-10-07 — Correct CV and Interview comparisons
- Replaced div-based table layouts (invalid div colSpan) with a shared semantic HTML table, real row/column spans, aligned fixed columns, accessible headers and horizontal scrolling on narrow screens.
- CV comparison now separates creation credits (1/3/4), analyses per CV (1/3/5), templates (3/5/6), evaluation detail, PDF export and non-expiring quota.
- Interview comparison follows current implementation: 0/30/120 minutes, paid session caps 10/15 minutes, selectable experience levels, basic Middle feedback vs detailed Enhance feedback, and optional device-local recording without unsupported 3/6 recording limits. Removed the unsupported company-culture tier claim and aligned related plan-card text.
- Verification: targeted ESLint and production build passed; existing bundle-size advisory remains. Browser visual verification was not performed. Preserved existing edits and commented combo section; no commit or push.

## 2026-10-07 — Diagnose deployed payment return to localhost
- Confirmed backend PaymentServiceImpl injects payos.return.url and payos.cancel.url, both defaulting to http://localhost:5173/, and sends these values when creating PayOS checkout links. Frontend redirects to the returned checkoutUrl; quota updates are handled independently by the payment webhook.
- No application code changed. Deployment runtime values were not inspected; advised configuring backend payment return/cancel URLs for the deployed frontend and testing a newly created checkout link. Existing application changes remain uncommitted.

## 2026-10-07 — Propose template-aware profile photo controls
- User requested a frontend hard-code proposal for hiding profile photo controls on data-scientist and boardroom-ready. Verified builder and editor toolbar both reuse ProfilePhotoPicker and selectedTemplateId is available via CVContext.
- Proposed one shared template capability helper and conditional rendering of the field/compact controls, preserving stored photo data when switching templates. No application changes; existing PricingPage and backend test edits remain uncommitted.

## 2026-10-07 — Hide profile photo controls for photo-free templates
- Added shared supportsProfilePhoto capability helper with data-scientist and boardroom-ready exclusions. ProfilePhotoPicker now returns no UI for these selected templates after all hooks, covering builder field and editor compact button.
- Stored profilePhoto remains unchanged when switching templates; photo controls return for supported templates. Preserved existing PricingPage and backend test edits.
- Verification: targeted ESLint, frontend production build and git diff --check passed; existing bundle-size advisory remains. No browser verification or commit/push performed. Changes remain uncommitted.

## 2026-10-07 — Remove builder entry quota check
- Removed automatic quota checking on builder mount. Initial quota state is idle so users can enter and fill the builder without a quota request or loading gate.
- Retained the explicit check before continuing to editor and converted retry to a click-only handler. Verified TemplateDetail already checks quota when Use Template is clicked before navigating to builder.
- Verification: targeted CVBuilder ESLint and frontend production build passed with existing bundle-size advisory. Git status command was denied by the user; no further Git inspection attempted. No commits or pushes; current changes remain uncommitted.

## 2026-10-07 — Move payment service into its feature
- Moved the sole src/services file, paymentService.js, to src/features/payment/services/paymentService.js and removed the empty old directory. Updated its shared apiClient import plus all seven consumers and the API client test loader; request endpoints and behavior unchanged.
- Verification exposed pre-existing related issues: paymentServiceInfo tests still expected monthly products, and InterviewSetup had unused React and effect-driven duration selection lint errors. Updated catalog test fixtures/expectations to current one-time quotas and derived the allowed selected duration without a synchronous state-setting effect.
- Final verification: all 32 frontend tests, targeted ESLint for all affected files, and production build passed (existing bundle-size advisory). Searched frontend references to confirm no old service path remains. No live payment transaction performed. Existing changes preserved; no commit or push.

## 2026-10-07 — Limit InterviewSetup change to service import
- User clarified InterviewSetup should only change its paymentService import. Restored the original React import, duration state and quota-driven duration effect; retained the new payment feature service path.
- Verification: frontend production build passed with existing bundle-size advisory. Original InterviewSetup lint issues remain; duration refactoring was not required for the service move. Changes remain uncommitted; no commit or push.

## 2026-10-07 — Limit CVBuilder change to service import
- User explicitly requested import-only changes in CVBuilder, superseding the earlier entry-quota removal request. Restored original quota loading state, mount/retry effect and button handler; retained the new paymentService import path.
- Verification: targeted ESLint passed; Git diff confirms CVBuilder differs from HEAD only in paymentService import. Existing changes remain uncommitted; no commit or push.

## 2026-10-07 — Restore requested builder entry behavior
- User reauthorized removing the builder entry quota check. Builder now starts idle without requesting quota on mount; explicit continuation and manual retry still check current quota. New payment service import retained; InterviewSetup unchanged.
- Verification: CVBuilder ESLint and production build passed with existing bundle-size advisory. No commit or push; changes remain uncommitted.

## 2026-10-07 — Commit and push reviewed changes
- Reviewed all tracked/untracked application changes and separated them into five commits: afdb794 payment service relocation; 46a5254 pricing tables/combo hiding/non-expiring tests; 0c59e2e portrait-free template controls; 81c8664 builder entry quota behavior; edc3589 existing cleanup-job test import correction.
- Fetched origin before committing and confirmed no divergence. Pushed dev successfully from 4d3ae94 to edc3589. Local SESSIONS.md skip-worktree preference preserved; session records excluded from commits.
- Verification: 32/32 frontend tests passed, latest frontend build passed; backend tests were not run. InterviewSetup retains original logic and its known lint issues. No live payment transaction performed.

## 2026-10-07 — Wait for interview question audio before listening

- Removed the fixed 15-second transition from asking to recording, which could enable the candidate microphone while longer TTS questions were still playing.
- Kept the post-answer transition delay in a dedicated processing timer and clear it on unmount.
- Validation: frontend production build succeeded; `git diff --check` passed.

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

## 2026-10-03 — History and My CVs GET API audit
- MyCVsPage calls GET /api/gallery/assets and reads result.cvs. UI expects title/updatedAt/localized status, while CVResponseDTO supplies name/status without updatedAt. Quick Add is local mock; editor navigation has no CV id.
- HistoryPage calls GET /api/gallery/interviews; detail code conditionally calls GET /api/gallery/interviews/{sessionId}/answers. Backend DTO lacks UI activity fields type/title/time/dateLabel/sessionId and frontend does not map them, preventing proper day grouping/detail gating.
- History makes no CV-history request; CV/download filters and load-more remain unconnected to activity data/pagination.
- Read-only application audit; no live authenticated calls or code edits. Git status/log checked; local backend/.claude remains outside commits.

## 2026-10-03 — Plan for My CVs and History data integration
- Plan only: expose existing CV createdAt/updatedAt in response DTO and map backend fields to frontend display models; use actual status/optimization state, remove local fake CV creation, add loading/error/empty/retry states.
- History plan: combine persisted CV creation records and interview sessions, sort/group by real dates, map session IDs and scores, respect restricted feedback, fix answerText/questionId contract for detail view; hide unsupported download activity and use client-side incremental display while APIs are unpaginated.
- Saved-CV editor persistence is a separate follow-up because previous lifecycle implementation was explicitly undone. No application code changed or tests run for this planning task.

## 2026-10-03 — Implement My CVs and History data integration
- CVResponseDTO now exposes inherited createdAt/updatedAt; MapStruct mapping verified. Interview mapper explicitly maps cvId/jdId/sessionId. Answer endpoints enrich questionText from the session snapshot, preserving ownership checks and plan-based feedback restrictions.
- MyCVsPage uses persisted CV names, dates, statuses, optimization state and scores; removes random local CV creation; adds loading/error/retry/empty states, preview fallback, and guarded server-side deletion. New CV actions navigate to templates. Editor button is explicitly unavailable pending the separately undone saved-editor lifecycle.
- HistoryPage combines real CV creation records and interview sessions, sorts/groups calendar dates, filters supported activity types, counts records, preserves zero scores, keeps undated records visible and displays incremental local batches. Independent API failures display the successful portion and a retry banner.
- Detail modal uses the existing session detail endpoint for answers and permitted evaluation, with questionText/answerText/skipped state, error/retry and stale-request protection on close or switching sessions.
- Verification: frontend 14/14 tests passed, production build passed, ESLint passed for all changed frontend files. Backend JDK21 Maven targeted tests: GalleryResponseMapperTest and InterviewServiceImplTest, 5/5 passed. No live authenticated browser/API verification; no schema migration needed; no commit or push.

## 2026-10-03 — Gallery test-data script
- Added backend/src/main/resources/db/manual/20261003_seed_gallery_test_data.sql for manual PostgreSQL execution. User replaces target_email with an existing ACTIVE account email; gallery is reused or created, then 4 CVs, 8 interviews and 16 answers are inserted atomically with deterministic account-specific IDs and ON CONFLICT DO NOTHING.
- Fixtures cover draft/completed/optimized/optimizing CVs, zero/null scores, today/yesterday/older dates, completed/in-progress sessions, skipped answers and snapshot question text. Subscription and quotas are preserved; paid-only feedback remains subject to the existing API entitlement guard.
- Verification: reviewed column names and enum values against entities and existing quota migration. Script has not been executed or syntax-validated by PostgreSQL; no psql runtime is available and target email is intentionally unset. No commit/push.

## 2026-10-03 — Pricing payment history audit
- Backend already implements authenticated GET /api/v1/payments/history: resolves account from principal email, queries OrderRepository.findByAccountId, maps orders to OrderResponseDTO (id, amount, status, paymentStatus, paymentMethod, orderedAt, checkoutUrl). Source entity is Order/table orders. No ordering or pagination in this query.
- PricingPage still renders a fixed invoices array. Its only payment GET on mount is quota; frontend paymentService has no getPaymentHistory method. View-all only shows a toast, and the download icon has no handler. No invoice/PDF download endpoint found in the payment module controller.
- Read-only audit; no application changes or live authenticated API call. Existing implementation and seed changes remain uncommitted.

## 2026-10-03 — Implement pricing payment history
- Backend history DTO now includes serviceId/serviceName; repository queries only the requested account with fetched service and newest-first ordering using orderedAt/createdAt fallback plus ID tie-break. Service uses a read-only transaction and tolerates missing legacy method/status/date fields.
- Frontend paymentService.getPaymentHistory uses authenticated apiClient. PricingPage replaces hardcoded invoice rows with an independent PaymentHistory component: latest 3 orders, real service/date/VND/status, full-ID clipboard copy, loading/empty/error/retry states and an all-orders modal with status filters and incremental local batches. Removed the unsupported PDF download icon.
- Tests: frontend 18/18 passed; Vite production build passed; changed-file ESLint passed after removing unused React import. Backend JDK21 targeted service and isolated H2 repository tests 3/3 passed, including account isolation and newest-first ordering with missing orderedAt. No live authenticated browser/API verification and no DB migration needed.
- Existing CV/history/seed work preserved. All changes remain uncommitted; no push.

## 2026-10-03 — Diagnose gallery assets failure with template_id
- User log confirms HttpMessageConversionException/InvalidDefinitionException: no serializer for ByteBuddyInterceptor. Reference chain points to result.cvs[3].template.hibernateLazyInitializer.
- CV.template is LAZY; CVResponseDTO exposes the CVTemplate entity directly and CVMapper passes that entity into the response. A non-null template_id therefore exposes a Hibernate proxy to Jackson. DTO also exposes Gallery entity and should use a response DTO/scalar ID.
- Recommended fix: map template to a plain DTO and gallery to plain ID/DTO, with relationships loaded/mapped within a read-only transaction or explicit fetch; add regression serialization test with a persisted linked template. Do not remove template_id or globally disable FAIL_ON_EMPTY_BEANS as the fix.
- Diagnosis only, no application changes or DB modifications. Existing work remains uncommitted.

## 2026-10-03 — Fix linked CV template JSON serialization
- CVResponseDTO now exposes galleryId and CVTemplateResponseDTO instead of Gallery/CVTemplate entities. CVMapper maps gallery.id and converts template using its existing template mapper. Gallery-list repository fetches gallery/template via EntityGraph; existing read-only service transaction completes mapping before serialization.
- Checked usages of CVResponseDTO and frontend gallery/template fields; no frontend dependency on the removed gallery object found. No entity or DB schema/data changes, no global Jackson exception suppression.
- Added isolated H2/MockMvc regression tests: persisted CV with template returns GET /api/gallery/assets 200 and plain template JSON outside the service transaction; CV without template returns 200; a real Hibernate lazy proxy maps to a serializable DTO after transaction closure. Account gallery isolation is also asserted.
- Verification JDK21: GalleryAssetsSerializationTest plus GalleryResponseMapperTest, 5/5 passed. First test run exposed missing createdAt in test fixture due to Lombok builder behavior; fixture corrected, production entity preserved. Maven compilation and diff whitespace check passed. Live user PostgreSQL/authenticated API not rechecked; backend restart needed.
- All current changes remain uncommitted; no push.

## 2026-10-03 — Sample data for specified account
- Confirmed existing CV/interview seed already targets the user-provided email; updated its instructions to match. Added 20261003_seed_payment_history_test_data.sql for the same ACTIVE account with 12 deterministic orders (3 PAID/PENDING/FAILED/REFUNDED each), using actual catalog service IDs and prices.
- Both scripts remain manual development fixtures, preserve existing rows on rerun, and do not change subscriptions/quotas or call PayOS. Payment seed fails atomically if the required service catalog is missing.
- Verification: email, counts, status combinations and INSERT columns reviewed against existing entity/catalog schema. PostgreSQL execution not performed; no credentials or DB rows modified. Files and existing application changes remain uncommitted.

## 2026-10-03 — Attach provided templates to sample CVs
- Updated gallery seed to assign the first four user-provided catalog IDs: portfolio-hybrid, cloud-expert, security-analyst and data-scientist. Validates all four templates exist before inserting any fixtures.
- Re-running fills template_id only for existing fixture CVs with NULL template_id and matching gallery, preserving user-assigned template links and every other field. Does not alter subscription access or catalog records.
- Verified INSERT column/value alignment and targeted conflict update from source; no PostgreSQL execution. Existing application changes and scripts remain uncommitted.

## 2026-10-03 — Assess CV card live template preview
- Confirmed MyCVsPage currently displays cv.image or a placeholder, despite assets already containing template.id and CV content. Existing TemplateRenderer maps catalog IDs to React templates and can be reused for rendered previews.
- Templates also read/use CVContext and editable controls; a correct preview must supply each card's saved content through isolated read-only context/render mode, scale a fixed document canvas, disable editing, and avoid sharing editor state. Merely passing userData does not populate all template sections.
- Proposed readonly preview per card and optional full-size modal with fallback for missing template/content. Feasibility only; no application change. Existing changes remain uncommitted.

## 2026-10-03 — Saved CV template previews
- MyCVsPage now renders each saved CV using template.id and its own content via SavedCVPreview; clicking the thumbnail opens a larger preview modal. Template name is shown on each card; missing content/template and unsupported template IDs have clear fallbacks.
- Added an isolated CVPreviewProvider and safe content normalization. EditableText renders plain text and ProfilePhotoPicker renders a static photo/placeholder in read-only mode; no preview state or localStorage changes affect the editor. Existing edit mode remains available outside preview context.
- Responsive preview scales a fixed template canvas using measured viewport width and document height. Compact cards show the document top; full previews reserve the complete scaled height and scroll inside the modal.
- Verification: 23 frontend tests passed with test-concurrency=1, covering all six templates, separate CV data, fallback cases, immutable normalization and regular editor textarea. Production build and changed-file ESLint passed. Initial parallel Vite tests hit Windows cache rename contention; new test has an isolated cache and serial rerun passed. Boardroom template intentionally lacks an education section, reflected in the test assertions.
- Browser visually verified six compact previews and a full preview using disposable sample data. Authenticated my-cvs verification was unavailable in the test browser; user subsequently confirmed the result was OK. Temporary HTML fixture and browser tab removed. No commit or push; current application changes remain uncommitted.

## 2026-10-03 — Plan editor database save and template entitlement enforcement
- Confirmed CVEditor has only print/PDF action and directly passes local TEMPLATES_DATA/setTemplate to the selector. It never calls existing createCV/updateCV client APIs. Unlike TemplateList, editor does not consume backend catalog locked flags, so Free users can select/render paid templates locally.
- Backend create/update DTOs already accept templateId, but service ignores it and never assigns CV.template or checks minimumPlan. Plan shared backend entitlement resolution using the current CV subscription (not Interview), validation before quota use, canonical selectedTemplateId, scoped read/update and transaction-safe template persistence.
- Plan frontend authenticated catalog selector with locked options, selection/save/export guards, upgrade prompt, and fail-closed catalog errors while preserving draft content. Add explicit save name/status UI; first save creates, subsequent saves update using returned/scoped CV ID. Restore persisted CV through a new owned GET /api/cv/{id} and /editor?cvId=... from My CVs; do not trust stale localStorage IDs across accounts.
- Preserve complete supported CV JSON, including photo/title currently absent from backend CVContent; validate fields and reconcile template relation/content. Maintain creation quota only for actual new CV, not updates/imported CV saves, and handle dirty state/navigation and duplicate clicks. Proposed expired-plan behavior: saved preview remains visible, paid template editing/export requires eligible plan or selecting an available template.
- Tests to cover plan matrix, forged API requests, expired plans, foreign-account access, DB roundtrip/template/serialization, first-vs-repeat save quota, full content, dirty state and selector errors. Planning only; no application change or tests run. Existing changes remain uncommitted.

## 2026-10-03 — Implement editor saving and CV template access
- User authorized implementation, explicitly deferred enabling the edit button in MyCVs and navigation/loading an existing saved CV into editor. Those entry points remain unchanged; owned GET detail and reopening workflow are deferred with them.
- Editor now loads the backend template catalog, disables locked/unknown templates, blocks editing/save/export while access is unresolved, and refreshes entitlements before saving/exporting. Default new draft template is the free the-standard. Added CV name, save/loading/error/retry states and unsaved-change warnings on close/reload.
- First save calls POST /api/cv, subsequent saves and imported CVs with a current in-memory ID call PUT /api/cv/{id}. Writer prevents duplicate concurrent requests. A stale localStorage CV ID is not restored without its content after reload, preventing accidental overwrite of an unrelated saved draft. Reopening saved drafts after reload remains deferred.
- Backend catalog and persistence share TemplateAccessPolicy based on current CV quota plan. Create/update validate names/content, resolve actual template IDs, reject mismatched IDs and unauthorized tiers before charging/writing, persist CV.template and canonical content.selectedTemplateId. Owner updates do not consume creation quota; imports/evaluation drafts without a template remain compatible.
- CVContent JSON now preserves profilePhoto and professionalTitle without a schema migration. Existing application changes preserved; MyCVs edit button stays disabled.
- Verification: 29 frontend tests passed serially, including duplicate saves, retry, access expiry, payload snapshots and toolbar locked/loading states; changed-file ESLint and production build passed (existing bundle-size advisory). JDK 21 Maven ran 9 save/access unit tests plus 4 H2 gallery/persistence tests, all passed, including JSON/DB photo/title/template round trip. git diff --check passed. Authenticated live-browser save flow was not exercised.
- No commit/push performed. Current application changes remain uncommitted and should be committed after user review.

## 2026-10-03 — Center builder continuation and check creation quota early
- Centered the builder completion button with mx-auto. Builder checks GET /api/v1/payments/quota on entry and refreshes before navigating to editor. Uses remainingCvCount, independent of AI/interview allowances; quota checks do not consume or reserve a creation.
- Exhausted quota shows a Vietnamese inline alert immediately in builder, disables continuation, and offers upgrade and retry. Loading, unavailable or malformed quota fail closed with retry. Existing server-side quota enforcement on save remains necessary if another tab consumes quota after the preflight check.
- Added builderQuota guard and three tests for exhaustion, rechecking and unavailable/invalid quota. 32 frontend tests passed, production build passed with existing bundle-size advisory, and changed-file ESLint passed after removing pre-existing unused declarations in builder.
- No database modifications, commit or push. Application changes remain uncommitted.

## 2026-10-03 — Check CV quota on template-detail use action
- TemplateDetail now checks current creation quota when the logged-in user clicks Use this template, before setting the template or navigating to builder. Exhaustion shows the shared Vietnamese message inline and as a toast, with a pricing upgrade link. Loading disables duplicate clicks; request failures keep the user on the detail page and allow retry. Guests are directed to login.
- Reuses the existing quota guard without consuming quota; builder and backend checks remain in place for later quota changes. Removed unused zoom declarations/imports from this page.
- Verification: page ESLint, three quota-guard tests and production build passed (existing bundle-size advisory). No commit or push; application changes remain uncommitted.

## 2026-10-03 — Pull teammate changes, resolve conflict and push dev
- Fetched origin/dev, which contained a22eea9 (saved CV reuse in builder) and b46dc46 (public health checks). Preserved current application work in fe69913 (CV/editor/history) and cc0ed0e (payment history), excluding session and agent configuration files.
- Pulled using a merge; the only conflict was the CVBuilder import block. Kept both galleryService and the payment/quota imports, preserving saved-CV selection, centered continuation and quota guards. Backend extraction changes merged automatically.
- Verification on integrated code: 32 frontend tests, production build, targeted ESLint and 21 backend tests on JDK 21 passed. Existing bundle-size advisory remains. No conflict markers or whitespace errors in changed code.
- Created merge commit 6b9173f and successfully pushed dev to origin/dev. SESSIONS.md and backend/.claude remain intentionally uncommitted; no application changes remain pending.
- Final untracked-file audit caught paymentHistory.js omitted from the payment staging list. Added the already-tested helper in a follow-up FIX commit and pushed it; this corrects the prior pending-file note.

## 2026-10-03 — Centralize test directories and hide local session changes
- Moved backend/src/test to backend/tests, preserving Java packages under tests/java and configuration under tests/resources. Moved both manual SQL fixtures from main resources to backend/tests/fixtures. Frontend tests were already centralized under frontend/tests and remain there.
- Updated Maven testSourceDirectory/testResources and documented locations plus IntelliJ Maven reload in CONTRIBUTING.md. No test code or fixture content changed.
- SESSIONS.md is tracked, so existing local exclude alone cannot hide modifications. Applied local skip-worktree (verified S flag), preserving file content and repository history; session modifications no longer appear in git status/SourceTree pending changes.
- Verification: Maven clean test with JDK 21 compiled from the new location and passed 21 targeted CV/gallery/interview/payment tests. Confirmed application-test.properties is copied to target/test-classes and old backend/src/test is absent. git diff --check passed. Layout changes remain uncommitted; no commit or push requested for this task.

## 2026-10-03 — Commit and push centralized tests
- User requested add, commit and push. Reviewed and staged only CONTRIBUTING.md, Maven test paths and moved tests/fixtures; all moved files were recognized as unchanged renames. Preserved local session skip-worktree and excluded backend/.claude.
- Fetched origin/dev, confirmed no newer commits, committed the test layout with a REFACTOR prefix and pushed successfully. Prior clean JDK 21 verification passed 21 targeted tests; staged whitespace check passed.

## 2026-10-14 — Remove obsolete synchronous CV analysis flow
- Removed the unused synchronous CV evaluation, feedback-generation and skill-gap flow from CVPipelineService/AIProviderService, including its private helpers, prompts and response DTOs. Kept the asynchronous analysis flow, JD recommendation scoring, feedback-history GET path and migration stubs.
- Static reference scan found no FE callsites for the retired service methods; old FE API wrappers remain declaration-only. A separate higher-scoring alternative-role service implementation also has no callers and remains for a separately reviewed cleanup.
- Maven backend compile and test-source compile passed; tests were not executed. No database changes.
## 2026-10-15 — Add frontend input validation
- Added client-side validation for personal profile data, CV contact/details before continuing/saving/exporting, JD length/content before evaluation, optional interview JD limits, career-goal length, and template feedback length/rating. Kept optional fields optional and aligned CV evaluation JD rules with backend requirements (80 characters, 12 words, 50,000 maximum).
- Account email is read-only in the profile editor because the existing profile update API ignores email changes. Existing files remain uncommitted; build, lint, and tests were not run.

## 2026-10-16 — Add inline CV editing and Chromium PDF rendering
- Added direct editing and section controls to the Standard CV template, including field add/remove, section reorder across columns, and drag/drop into gaps; preserved section and custom-field layout in editor data.
- Routed Standard CV PDF export through the backend OpenFeign client to the separate Playwright/Chromium PDF service, with A4 print options and body margin reset for the downloaded PDF.
- Added validation for CV builder/editor export and save flows. Targeted ESLint and `git diff --check` passed; full Vite build was blocked because the environment denies reading `frontend/.env`.

## 2026-10-16 — Share CV editing across all templates
- Replaced the Standard-only HTML editor/export path with a shared editable HTML CV template for all six templates. Added per-template section layouts and preserved each template's column structure, theme colors, typography and padding while enabling inline fields, section and field controls, skill groups, multiline bullets, drag/drop and hidden-section restore.
- All template previews now use the shared HTML output; PDF export for every template uses the PDF service with A4/print-background options. Preserved object-based custom personal fields when editing from the content panel.
- Verification: targeted ESLint and `git diff --check` passed. Frontend tests reported 46 passing; four test files could not initialize because the environment denies reads of `frontend/.env`. Production build not run.

- Rechecked the attached Chromium PDF and found low-contrast summary text, an empty award heading, blank project labels, and page-two content starting at the top edge. Adjusted single-column print flow, made summary text readable, and suppressed empty sections/optional project labels in read-only PDF output. Export again to verify the revised layout.

- Compared three newly exported PDFs (Security Analyst, Portfolio Hybrid, Cloud Expert). All had low-contrast summary/title text and column content splitting into nearly empty pages; adjusted variant text colors and dark-sidebar text, with empty sections suppressed in read-only rendering. The existing PDFs cannot reflect source changes; Chromium export needs to be rerun for final visual confirmation.

- Synchronized edit outlines with the matching section/field toolbar (including keyboard focus) and clear drag/drop target outlines on drag end, so only the active area remains highlighted.

- Corrected cross-column drag feedback: the dragged section keeps its existing outline and toolbar; hovered section targets show their toolbar with the existing drop outline; blank main-column space now receives drag-over/drop events. Drag end clears temporary markers.

- Reviewed the latest Standard PDF: summary text was still white on white, and the project section was pushed intact onto page two. Changed summary to readable body text and allowed sections/timeline entries to fragment across pages while keeping section headings with content.
- Added A4 page-boundary markers with page labels in the left gutter outside the CV in the editor preview. Labels stay visible while their divider line appears on label hover; markers track preview height changes and remain separate from the HTML sent to the PDF service.
- Made the profile-photo block a movable/removable CV section in templates that support photos. It shows a silhouette placeholder when no image is set, excludes Data Scientist and Boardroom Ready, and reserves the same height with or without a photo to prevent layout shifts.
- Removed the visible photo-section heading and its add action; its section toolbar still supports drag, reorder, and remove.
- Set the native drag image to the full section being moved, anchored at the drag handle, so users see the actual section preview follow the pointer.
- Added a translucent clone of the dragged section at its prospective before/after location or at the end of a blank target column. The preview is removed on drop or drag cancellation; after/before drop handling now matches the indicated location.
- Revised the drag preview to render the cloned section in document flow so surrounding items reflow into their post-drop positions. Pointer-over-preview guards keep the insertion preview stable while the pointer is above it.

## 2026-10-16 — Fetch and test feature/rework-cv on an isolated local branch
- Started from clean dev at aabf602; fetched origin, fast-forwarded dev through seven commits to 50e5c07, created codex/test-rework-cv and pulled origin/feature/rework-cv through four more commits to 7fc6df0. No merge back to dev/main or push performed.
- Reviewed rework: shared six-template editable HTML/CSS preview with inline edits, section/group reorder controls and structured CV fields; export serializes self-contained HTML and calls authenticated backend /api/cv/pdf, which proxies through Feign to separate stateless Spring PDF service using Playwright Chromium. Added form input validation across CV/profile/interview/JD flows.
- Frontend production build passed. Full frontend tests: 69 total, 67 passed, two failed: public catalog adapter expectation after /auth/me preflight (same catalog implementation on origin/dev), and saved preview test still expecting the retired PDF-loading placeholder. New inputValidation.js has two no-useless-escape lint errors at line 80; focused renderer/editor lint otherwise passed. React warned about spreading key in CvSection props.
- Full backend suite compiled and ran 173 tests: 149 passed, 24 errors, zero assertion failures. Root causes include old integration fixtures missing Account.provider or explicit CVTemplate IDs, imports of service interfaces as concrete beans, and missing RoleTaxonomyService in a test context. Did not claim all errors are introduced by this branch; no baseline test run was performed.
- PDF service test context passed (1 test); Playwright installed its required browser binaries in the local cache and launched Chromium under Java 21 (module targets Java 17). No live application database changes made.
- Checked supplied Render service health (HTTP 200) and a synthetic PDF smoke test (HTTP 200/application/pdf). Generated HTML from each of the six actual templates with synthetic data and rendered all six through the remote service successfully. pypdf confirmed extractable Vietnamese names and content. Reviewed a six-template contact sheet; the two single-column templates spill only the language section onto page two for the short sample, worth tightening before merge.
- Generated review artifacts only under ignored pdf-service/target/rework-review and frontend/node_modules/.cache. No real CV/person data submitted. Tests exercised PDF service directly, not the full authenticated browser editor/save/export journey.
- Deployment checks: backend listens on 8080 and reads PDF_SERVICE_URL (default http://localhost:8081); PDF service listens on 8081, with Docker EXPOSE, local port mapping, and README examples aligned to 8081. Existing dev changes also require the manual CV optimization result_snapshot migration if not yet applied. Public PDF endpoint accepts requests without app authentication and is intended for trusted callers per README.
- Recommendation: keep on the test branch until the two frontend expectations, backend test setup failures, lint and pagination spacing are addressed; do not label this ready to merge based only on a passing build. Only SESSIONS.md is modified in tracked files and remains uncommitted.

## 2026-10-16 — Publish rework CV review findings
- User requested a file describing fixes needed and a push. Created docs/reviews/2026-10-16-rework-cv-review.md with observed test failures, exact locations, remediation proposals, pagination findings, Docker port mismatch and acceptance checks.
- Distinguished outdated test contracts/fixtures from confirmed production defects and recorded that no full baseline suite or authenticated browser export journey was run.
- Documentation only: no feature fixes or merge into dev/main. Authorized publication targets codex/test-rework-cv, preserving feature/rework-cv itself.

## 2026-10-16 — Rename the CV review branch
- User requested renaming codex/test-rework-cv to test/test-rework-cv on local and remote. Updated the current branch name in the review document; previous session entries retain historical names.
- Verified the destination name was unused and the old remote pointed at 6dd1446 before renaming. Publish the renamed branch and remove the old remote ref only after confirming the new ref.

## 2026-10-16 — Fix findings from the CV rework review
- Updated the public template catalog tests to cover guest, signed-in and expired-token refresh flows; marked the catalog request as public. Replaced the obsolete saved-preview loading assertion with read-only stored-content checks for all six templates.
- Fixed backend integration-test setup in the five reported classes: explicit local account provider, concrete service imports and missing collaborators, CV template defaults, quota fixture values, and the quota result mock used when creating a CV. No test was disabled.
- Fixed the date-validation regex and added valid, impossible and future-date cases. Passed the section React key directly instead of spreading it from props. Tightened spacing for the two single-column print templates and aligned PDF Docker exposure/docs to port 8081.
- Verification: frontend suite 73/73, focused ESLint, and production build passed (using a temporary Vite config that kept the sandbox from reading the restricted `frontend/.env`; the temporary config was removed). All 27 tests in the five backend classes from the review passed. Full backend suite ran 173 tests with 17 context/setup errors (zero assertion failures): Java/Spring could not establish loopback connections (`Permission denied: connect`), including on the escalated rerun. PDF service startup test could not install its Playwright browser in this environment, including on the escalated rerun. A fresh PDF was not rendered for visual pagination confirmation.
- Updated `docs/reviews/2026-10-16-rework-cv-review.md` with the resolution status. Changes remain uncommitted; no push or merge.

## 2026-10-16 — Require login before CV evaluation import actions
- Kept the CV evaluation page publicly viewable, but redirect guests to login before opening the file picker, accepting a dropped CV, requesting JD recommendations, or starting evaluation. Added a guard to the saved-CV continuation path so it cannot make an authenticated recommendation request as a guest; expired sessions during these requests also return to login instead of leaving the user on a 401 error.
- Prevented unauthenticated 401 responses from being marked as expired sessions, so the login page only shows the expiration notice after a request that actually carried an access token is confirmed expired. Removed the unused query-string override for that notice.
- Verification: frontend tests passed 74/74, focused ESLint and `git diff --check` passed. Changes remain uncommitted.

## 2026-10-17 — Use plain-language feedback across the frontend
- Replaced technical network/server error details with user-friendly guidance, kept expired-session wording separate from ordinary sign-in errors, and translated key CV import/evaluation failures into actionable Vietnamese. Simplified CV evaluation progress, result explanations, and feedback for authentication, PDF export, feedback submission, and interview recording.
- Added tests for technical error filtering and CV assessment messages; frontend suite passed 76/76, final focused API and formatter tests passed 23/23, focused ESLint passed for the primary changed components, and `git diff --check` passed. ESLint still reports existing React Hooks rule errors in `FeedbackWidget.jsx` and `InterviewResult.jsx`; the reported lines are pre-existing effect/declaration patterns, not the changed message handling. Changes remain uncommitted.

## 2026-10-17 — Clarify CV import fields and PDF export diagnostics
- Expanded the CV import prompt with per-section JSON examples, clarified grouped versus ungrouped skill mapping, corrected OCR-split certificate examples, and retained education details through backend/frontend mapping. Added structured-field logs after extraction, import persistence, and analysis snapshot creation/reuse; logs omit source text and profile photos.
- Added PDF export failure-stage logging in the frontend and request failure diagnostics in the backend PDF proxy. Updated the `done` skill to summarize planned stage/commit groups before Git mutations without asking a yes/no approval question.
- Verification: `CVImportRoleTest` passed (3 tests), `cvPdfRenderer.test.js` passed (6 tests), focused ESLint passed for the changed PDF export files, and `git diff --check` passed. Production build could not run because the sandbox denies access to `frontend/.env`.

## 2026-10-17 — Summarize every Git approval operation
- Refined the `done` skill so each individual `git add` and `git commit` operation gets its own plain-language summary immediately beforehand. Commit summaries must state the subject and included changes; approval justifications must describe the action instead of showing raw terminal syntax.

## 2026-10-17 — Remove full CV objects from logs
- Replaced the post-extraction CV object dump with field-presence and section-count metadata only. Removed full structured CV dumps from import persistence and analysis snapshot logs to reduce log volume and avoid writing personal CV content to logs.
- Verification: `CVImportRoleTest` passed; a source scan found no remaining full-object CV extraction log statements, and `git diff --check` passed.

## 2026-10-20 — Fix frontend layout utility classes
- Corrected invalid width and corner-radius utilities in the login/logout loading overlays; set login and logout loading overlays to inline grid centering and viewport-based inline dialog widths after the reported view still showed a narrow card and template feedback modal. Fixed missing max-width utilities in the interview landing page, made its feature/benefit sections fit a centered content column, improved narrow-screen card stacking, and restored full contrast on the interview setup primary action.
- Verification: removed the custom-theme-conflicting max-w-md class from both loading dialogs; browser preview on localhost:5173 measured the login dialog at 448px in a 502px viewport. Source scan and git diff --check passed.

## 2026-10-21 — Align editable CV templates with their references
- Reworked the editable and PDF template renderers so section order, skill tiers, project links, contact details, profile imagery, and template-specific styling stay consistent between the editor and export. Matched the Cloud Specialist reference with a responsive navy identity panel, angled summary background, dynamic contact and summary heights, and balanced skill cells.
- Verification: inspected the rendered Cloud Specialist template in the localhost editor, confirmed computed geometry and dynamic spacing, and completed the frontend production build with the isolated review Vite config.

## 2026-10-21 — Preserve interview setup progress and quota state
- Persisted wizard choices as they are made, moved the quota snapshot to the interview session, restored draft setup values, and prevented navigation into setup before quota data is available. Improved route transitions and responsive layout details across authentication, interview, CV evaluation, and feedback views.
- Verification: the complete frontend production build passed after the interview flow and layout changes.

## 2026-10-21 — Specify GA4 analytics implementation
- Added `.spec/analytics-ga4-implementation-plan.md` covering frontend tracking, event definitions, SPA navigation, consent and data minimization, production/test separation, dashboards, and a later backend Measurement Protocol/outbox phase for confirmed outcomes.
- Cross-checked integration points against authentication, CV analysis, interview and payment code; documented deduplication limits, DB reconciliation, rollout and acceptance checks. This task changes documentation only; application tests were not run. The `.spec/` directory remains ignored by the existing Git configuration.

## 2026-10-22 — Finalize frontend GA4 integration
- Reviewed and grouped the pending frontend analytics implementation: consent controls, environment and hostname gates, sanitized SPA page views, event schemas, and authentication/CV/interview/checkout instrumentation.
- Included setup documentation and analytics regression tests. Kept local browser profiles and `frontend/vite.review.config.js` outside the feature commit; the analytics spec remains ignored.
- Verification: all 83 frontend tests passed; `npm run build -- --config vite.review.config.js` passed using the existing isolated review configuration, with large-chunk warnings. `git diff --check` passed. Live GA4 ingestion and production configuration were not verified.

## 2026-10-22 — Ignore local review artifacts
- Added root-scoped ignore rules for the local Chrome/Edge profiles and `frontend/vite.review.config.js`, preserving these files on disk while excluding them from Git.

## 2026-10-22 — Specify CV builder step-four mapping corrections
- Documented confirmed renderer failure, unconfirmed-input loss, incomplete field contracts and conditional hidden-section behavior in `.spec/cv-builder-step4-mapping-spec.md`, including proposed behavior and acceptance tests.
- Documentation only; no application changes. The earlier read-only SSR check reproduced blank-skill failures on five templates and confirmed populated item names on all six. Browser interaction and PDF export remain to be verified during implementation. The spec directory remains ignored by Git.

## 2026-10-22 - Align three CV templates with supplied references
- Data Scientist: centered identity/contact header, monochrome section rules, work/education date alignment, skills by category and soft-skill bullets.
- Security Analyst and Boardroom Ready: shared single-column reference layout, muted teal headings/icons, gray summary/contact band, skill rows and role/company/date experience headings. Supplied reference images for these two templates are identical.
- Security Analyst no longer displays a profile photo; stored photo data is retained. Old sidebar section orders migrate into the visible main column without dropping content.
- Fixed blank skill names referencing an undefined onEdit variable in the shared skill grouping helper.
- Validation: 15 targeted CV/editor/saved-preview tests passed; targeted ESLint and frontend production build passed. Generated HTML for all six templates and inspected Chromium screenshots of the three changed templates using synthetic data. Live authenticated editor actions and remote PDF service were not exercised.
- User authorized commit and push to dev; fetched origin and confirmed no divergence, then reran all 15 targeted tests successfully before publishing. Groq 403 was diagnosed only; no backend fix is included.
