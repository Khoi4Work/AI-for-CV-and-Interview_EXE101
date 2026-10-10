-- Run before deploying CV one-time quota changes. Interview subscription columns are untouched.
BEGIN;
CREATE TABLE IF NOT EXISTS manual_schema_migrations (
    version varchar(120) PRIMARY KEY,
    applied_at timestamptz NOT NULL DEFAULT NOW()
);

ALTER TABLE user_usage_quotas
    ADD COLUMN IF NOT EXISTS remaining_cv_free_credits integer NOT NULL DEFAULT 0,
    ADD COLUMN IF NOT EXISTS remaining_cv_middle_credits integer NOT NULL DEFAULT 0,
    ADD COLUMN IF NOT EXISTS remaining_cv_enhance_credits integer NOT NULL DEFAULT 0;

ALTER TABLE cvs
    ADD COLUMN IF NOT EXISTS ai_analysis_limit integer NOT NULL DEFAULT 1,
    ADD COLUMN IF NOT EXISTS ai_analysis_remaining integer NOT NULL DEFAULT 0;

-- Expired legacy monthly CV plans remain expired; restore only the FREE creation credit.
UPDATE user_usage_quotas
SET cv_plan = 'FREE',
    cv_period_start = NULL,
    cv_period_end = NULL,
    cv_expiry_email_sent = false,
    remaining_cv_cnt = 1,
    remaining_cv_ai_cnt = 0
WHERE cv_plan <> 'FREE' AND cv_period_end IS NOT NULL AND cv_period_end <= NOW()
  AND NOT EXISTS (SELECT 1 FROM manual_schema_migrations WHERE version = '20261005_cv_one_time_package_quota');

-- CV package credits are classified by the package currently represented in the old quota row.
-- This preserves remaining creation credits without treating Interview as a monthly CV package.
UPDATE user_usage_quotas
SET remaining_cv_free_credits = CASE WHEN cv_plan = 'FREE' THEN GREATEST(0, remaining_cv_cnt) ELSE 0 END,
    remaining_cv_middle_credits = CASE WHEN cv_plan = 'MIDDLE' THEN GREATEST(0, remaining_cv_cnt) ELSE 0 END,
    remaining_cv_enhance_credits = CASE WHEN cv_plan = 'ENHANCE' THEN GREATEST(0, remaining_cv_cnt) ELSE 0 END,
    remaining_cv_cnt = GREATEST(0, remaining_cv_cnt),
    cv_period_start = NULL,
    cv_period_end = NULL,
    cv_expiry_email_sent = false
WHERE remaining_cv_free_credits = 0
  AND remaining_cv_middle_credits = 0
  AND remaining_cv_enhance_credits = 0
  AND NOT EXISTS (SELECT 1 FROM manual_schema_migrations WHERE version = '20261005_cv_one_time_package_quota');

-- Backfill existing CVs from legacy account-wide remaining AI quota, oldest CV first.
-- Each old CV keeps a per-CV cap matching its account's current plan; only the old remaining
-- account-wide balance is distributed, so the migration does not grant every CV a fresh balance.
WITH ranked_cvs AS (
    SELECT c.id,
           q.account_id,
           q.remaining_cv_ai_cnt AS legacy_remaining,
           CASE q.cv_plan WHEN 'ENHANCE' THEN 5 WHEN 'MIDDLE' THEN 3 ELSE 1 END AS per_cv_limit,
           ROW_NUMBER() OVER (PARTITION BY q.account_id ORDER BY c.created_at, c.id) AS cv_rank
    FROM cvs c
    JOIN gallery g ON g.id = c.gallery_id
    JOIN user_usage_quotas q ON q.account_id = g.account_id
), allocation AS (
    SELECT id,
           per_cv_limit,
           LEAST(per_cv_limit, GREATEST(legacy_remaining - (per_cv_limit * (cv_rank - 1)), 0)) AS per_cv_remaining
    FROM ranked_cvs
)
UPDATE cvs c
SET ai_analysis_limit = a.per_cv_limit,
    ai_analysis_remaining = a.per_cv_remaining
FROM allocation a
WHERE c.id = a.id
  AND NOT EXISTS (SELECT 1 FROM manual_schema_migrations WHERE version = '20261005_cv_one_time_package_quota');

-- Keep any legacy AI balance that could not fit on existing CVs; the next newly-created CV
-- receives up to its tier limit from this pool before the account switches to new per-CV grants.
WITH ranked_cvs AS (
    SELECT c.id,
           q.account_id,
           q.remaining_cv_ai_cnt AS legacy_remaining,
           CASE q.cv_plan WHEN 'ENHANCE' THEN 5 WHEN 'MIDDLE' THEN 3 ELSE 1 END AS per_cv_limit,
           ROW_NUMBER() OVER (PARTITION BY q.account_id ORDER BY c.created_at, c.id) AS cv_rank
    FROM cvs c
    JOIN gallery g ON g.id = c.gallery_id
    JOIN user_usage_quotas q ON q.account_id = g.account_id
    WHERE q.remaining_cv_ai_cnt > 0
), allocation AS (
    SELECT account_id,
           LEAST(per_cv_limit, GREATEST(legacy_remaining - (per_cv_limit * (cv_rank - 1)), 0)) AS allocated
    FROM ranked_cvs
)
UPDATE user_usage_quotas q
SET remaining_cv_ai_cnt = GREATEST(q.remaining_cv_ai_cnt - COALESCE((
        SELECT SUM(a.allocated) FROM allocation a WHERE a.account_id = q.account_id
    ), 0), 0)
WHERE q.remaining_cv_ai_cnt > 0
  AND NOT EXISTS (SELECT 1 FROM manual_schema_migrations WHERE version = '20261005_cv_one_time_package_quota');

-- billing_units for CV catalog rows now means CV creation credits. Interview units remain minutes.
UPDATE payment_services SET billing_units = 3
WHERE category = 'CV' AND package_code = 'MIDDLE'
  AND NOT EXISTS (SELECT 1 FROM manual_schema_migrations WHERE version = '20261005_cv_one_time_package_quota');
UPDATE payment_services SET billing_units = 4
WHERE category = 'CV' AND package_code = 'ENHANCE'
  AND NOT EXISTS (SELECT 1 FROM manual_schema_migrations WHERE version = '20261005_cv_one_time_package_quota');

UPDATE cv_benefit b SET max_templates = 5
FROM payment_services s
WHERE b.service_id = s.id AND s.category = 'CV' AND s.package_code = 'MIDDLE'
  AND NOT EXISTS (SELECT 1 FROM manual_schema_migrations WHERE version = '20261005_cv_one_time_package_quota');
UPDATE cv_benefit b SET max_templates = 6
FROM payment_services s
WHERE b.service_id = s.id AND s.category = 'CV' AND s.package_code = 'ENHANCE'
  AND NOT EXISTS (SELECT 1 FROM manual_schema_migrations WHERE version = '20261005_cv_one_time_package_quota');

-- The repository currently contains six templates: 3 FREE, 2 MIDDLE, and 1 ENHANCE.
UPDATE cv_templates SET minimum_plan = 'FREE'
WHERE id IN ('the-standard', 'portfolio-hybrid', 'cloud-expert')
  AND NOT EXISTS (SELECT 1 FROM manual_schema_migrations WHERE version = '20261005_cv_one_time_package_quota');
UPDATE cv_templates SET minimum_plan = 'MIDDLE'
WHERE id IN ('boardroom-ready', 'security-analyst')
  AND NOT EXISTS (SELECT 1 FROM manual_schema_migrations WHERE version = '20261005_cv_one_time_package_quota');
UPDATE cv_templates SET minimum_plan = 'ENHANCE'
WHERE id = 'data-scientist'
  AND NOT EXISTS (SELECT 1 FROM manual_schema_migrations WHERE version = '20261005_cv_one_time_package_quota');

INSERT INTO manual_schema_migrations(version) VALUES ('20261005_cv_one_time_package_quota')
ON CONFLICT (version) DO NOTHING;
COMMIT;
