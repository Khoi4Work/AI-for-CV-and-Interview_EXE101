-- Persists each proposed optimization independently until the user chooses to save it.
-- Manual migration: the application does not execute this script at startup.
ALTER TABLE cv_optimization_jobs
    ADD COLUMN IF NOT EXISTS result_snapshot TEXT;
