-- Run once before deploying the split CV/Interview subscription model.
ALTER TABLE user_usage_quotas
    ADD COLUMN IF NOT EXISTS cv_plan varchar(20) NOT NULL DEFAULT 'FREE',
    ADD COLUMN IF NOT EXISTS interview_plan varchar(20) NOT NULL DEFAULT 'FREE',
    ADD COLUMN IF NOT EXISTS cv_period_start timestamp,
    ADD COLUMN IF NOT EXISTS cv_period_end timestamp,
    ADD COLUMN IF NOT EXISTS interview_period_start timestamp,
    ADD COLUMN IF NOT EXISTS interview_period_end timestamp,
    ADD COLUMN IF NOT EXISTS cv_expiry_email_sent boolean NOT NULL DEFAULT false,
    ADD COLUMN IF NOT EXISTS interview_expiry_email_sent boolean NOT NULL DEFAULT false;

ALTER TABLE interview_sessions
    ADD COLUMN IF NOT EXISTS interview_started_at timestamp,
    ADD COLUMN IF NOT EXISTS interview_last_activity_at timestamp,
    ADD COLUMN IF NOT EXISTS quota_period_start_at_reservation timestamp,
    ADD COLUMN IF NOT EXISTS reserved_interview_minutes integer NOT NULL DEFAULT 0,
    ADD COLUMN IF NOT EXISTS interview_quota_settled boolean NOT NULL DEFAULT true;

-- Recover the current paid category and period from payment history instead of
-- copying the old account-wide plan into both services.
WITH latest_paid_cv AS (
    SELECT DISTINCT ON (o.account_id)
           o.account_id, ps.package_code, ps.billing_units, o.ordered_at,
           o.ordered_at + interval '1 month' AS period_end
    FROM orders o
    JOIN payment_services ps ON ps.id = o.service_id
    WHERE o.payment_status = 'PAID' AND ps.category = 'CV'
    ORDER BY o.account_id, o.ordered_at DESC, o.created_at DESC
)
UPDATE user_usage_quotas q
SET cv_plan = CASE WHEN p.period_end > NOW() THEN p.package_code ELSE 'FREE' END,
    cv_period_start = p.ordered_at,
    cv_period_end = p.period_end,
    cv_expiry_email_sent = (p.period_end <= NOW()),
    remaining_cv_cnt = CASE WHEN p.period_end > NOW() THEN
        GREATEST(0, p.billing_units - GREATEST(0,
            (CASE p.package_code WHEN 'MIDDLE' THEN 5 WHEN 'ENHANCE' THEN 10 ELSE 0 END)
            + p.billing_units - q.remaining_cv_cnt))
        ELSE 1 END,
    remaining_cv_ai_cnt = CASE WHEN p.period_end > NOW() THEN
        GREATEST(0, (CASE p.package_code WHEN 'MIDDLE' THEN 5 WHEN 'ENHANCE' THEN 10 ELSE 1 END)
            - GREATEST(0, (CASE p.package_code WHEN 'MIDDLE' THEN 10 WHEN 'ENHANCE' THEN 50 ELSE 1 END)
            - q.remaining_cv_ai_cnt))
        ELSE 1 END
FROM latest_paid_cv p
WHERE q.account_id = p.account_id;

WITH latest_paid_interview AS (
    SELECT DISTINCT ON (o.account_id)
           o.account_id, ps.package_code, ps.billing_units, o.ordered_at,
           o.ordered_at + interval '1 month' AS period_end
    FROM orders o
    JOIN payment_services ps ON ps.id = o.service_id
    WHERE o.payment_status = 'PAID' AND ps.category = 'INTERVIEW'
    ORDER BY o.account_id, o.ordered_at DESC, o.created_at DESC
)
UPDATE user_usage_quotas q
SET interview_plan = CASE WHEN p.period_end > NOW() THEN p.package_code ELSE 'FREE' END,
    interview_period_start = p.ordered_at,
    interview_period_end = p.period_end,
    interview_expiry_email_sent = (p.period_end <= NOW()),
    remaining_int_min = CASE WHEN p.period_end > NOW() THEN p.billing_units ELSE 0 END
FROM latest_paid_interview p
WHERE q.account_id = p.account_id;

-- The legacy application used the same CV product ID for CV and Interview
-- buttons and activated both entitlements on payment. Preserve that behavior
-- for active legacy subscriptions when no separately categorized Interview
-- order exists; new purchases use separate service IDs/categories.
WITH latest_paid_legacy_product AS (
    SELECT DISTINCT ON (o.account_id)
           o.account_id, ps.package_code, o.ordered_at,
           o.ordered_at + interval '1 month' AS period_end
    FROM orders o
    JOIN payment_services ps ON ps.id = o.service_id
    WHERE o.payment_status = 'PAID' AND ps.category = 'CV'
    ORDER BY o.account_id, o.ordered_at DESC, o.created_at DESC
)
UPDATE user_usage_quotas q
SET interview_plan = q.plan,
    interview_period_start = p.ordered_at,
    interview_period_end = p.period_end,
    interview_expiry_email_sent = false,
    remaining_int_min = CASE q.plan WHEN 'MIDDLE' THEN 30 WHEN 'ENHANCE' THEN 120 ELSE 0 END
FROM latest_paid_legacy_product p
WHERE q.account_id = p.account_id
  AND q.interview_period_end IS NULL
  AND q.plan = p.package_code
  AND q.plan <> 'FREE'
  AND p.period_end > NOW();

-- Legacy plans with no matching paid service are not carried across categories.
UPDATE user_usage_quotas
SET cv_plan = 'FREE', remaining_cv_cnt = 1, remaining_cv_ai_cnt = 1
WHERE cv_period_end IS NULL;

UPDATE user_usage_quotas
SET interview_plan = 'FREE', remaining_int_min = 0
WHERE interview_period_end IS NULL;

ALTER TABLE user_usage_quotas DROP COLUMN IF EXISTS plan;
