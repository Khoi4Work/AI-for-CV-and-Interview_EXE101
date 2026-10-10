-- Run before deploying one-time Interview package changes.
-- Preserves each account's current plan and remaining minutes; only removes monthly period metadata.
BEGIN;
CREATE TABLE IF NOT EXISTS manual_schema_migrations (
    version varchar(120) PRIMARY KEY,
    applied_at timestamptz NOT NULL DEFAULT NOW()
);

UPDATE user_usage_quotas
SET interview_period_start = NULL,
    interview_period_end = NULL,
    interview_expiry_email_sent = false
WHERE NOT EXISTS (
    SELECT 1 FROM manual_schema_migrations
    WHERE version = '20261005_interview_one_time_quota'
);

INSERT INTO manual_schema_migrations(version) VALUES ('20261005_interview_one_time_quota')
ON CONFLICT (version) DO NOTHING;
COMMIT;
