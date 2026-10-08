# Session History

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
