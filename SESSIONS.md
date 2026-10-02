# Session History

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
