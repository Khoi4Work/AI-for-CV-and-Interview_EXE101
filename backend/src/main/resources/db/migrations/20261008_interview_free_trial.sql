-- Run once before deploying the free Interview trial.
-- Grants five minutes to existing Free accounts; preserves purchased minutes.
BEGIN;
CREATE TABLE IF NOT EXISTS manual_schema_migrations (
    version varchar(120) PRIMARY KEY,
    applied_at timestamptz NOT NULL DEFAULT NOW()
);

UPDATE user_usage_quotas
SET remaining_int_min = remaining_int_min + 5
WHERE interview_plan = 'FREE'
  AND NOT EXISTS (
    SELECT 1 FROM manual_schema_migrations
    WHERE version = '20261008_interview_free_trial'
  );

INSERT INTO manual_schema_migrations(version) VALUES ('20261008_interview_free_trial')
ON CONFLICT (version) DO NOTHING;
COMMIT;
