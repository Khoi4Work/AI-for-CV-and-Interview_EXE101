# Session History

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
