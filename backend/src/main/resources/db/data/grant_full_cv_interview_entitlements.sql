-- PostgreSQL one-off grant for a single account.
-- Replace the email below before running this script.
-- Grants the current ENHANCE entitlements for both CV and Interview.
-- This changes quota/plan state only; it does not create a payment order or alter the account role/status.

BEGIN;

DO $grant$
DECLARE
    target_email text := 'linhvantin01@gmail.com';
    target_account_id uuid;
    updated_cv_count integer;
BEGIN
    IF target_email = 'replace-with-account-email@example.com' THEN
        RAISE EXCEPTION 'Edit target_email in this script before running it.';
    END IF;

    SELECT id
    INTO target_account_id
    FROM account
    WHERE lower(email) = lower(target_email);

    IF target_account_id IS NULL THEN
        RAISE EXCEPTION 'No account found for email %.', target_email;
    END IF;

    -- Current ENHANCE package: four one-time CV creation credits and five AI analyses per CV.
    -- Clear lower-tier credits so newly created CVs consume ENHANCE credits first and receive the full analysis allowance.
    INSERT INTO user_usage_quotas (
        id,
        created_at,
        updated_at,
        account_id,
        remaining_cv_cnt,
        remaining_int_min,
        remaining_cv_ai_cnt,
        remaining_cv_free_credits,
        remaining_cv_middle_credits,
        remaining_cv_enhance_credits,
        cv_plan,
        interview_plan,
        cv_period_start,
        cv_period_end,
        interview_period_start,
        interview_period_end,
        cv_expiry_email_sent,
        interview_expiry_email_sent
    ) VALUES (
        gen_random_uuid(),
        NOW(),
        NOW(),
        target_account_id,
        4,
        120,
        0,
        0,
        0,
        4,
        'ENHANCE',
        'ENHANCE',
        NULL,
        NULL,
        NULL,
        NULL,
        false,
        false
    )
    ON CONFLICT (account_id) DO UPDATE SET
        updated_at = NOW(),
        remaining_cv_cnt = 4,
        remaining_int_min = 120,
        remaining_cv_ai_cnt = 0,
        remaining_cv_free_credits = 0,
        remaining_cv_middle_credits = 0,
        remaining_cv_enhance_credits = 4,
        cv_plan = 'ENHANCE',
        interview_plan = 'ENHANCE',
        cv_period_start = NULL,
        cv_period_end = NULL,
        interview_period_start = NULL,
        interview_period_end = NULL,
        cv_expiry_email_sent = false,
        interview_expiry_email_sent = false;

    -- Existing CVs also receive the current ENHANCE allowance of five analyses each.
    UPDATE cvs c
    SET ai_analysis_limit = 5,
        ai_analysis_remaining = 5
    FROM gallery g
    WHERE c.gallery_id = g.id
      AND g.account_id = target_account_id;

    GET DIAGNOSTICS updated_cv_count = ROW_COUNT;
    RAISE NOTICE 'Granted ENHANCE CV and Interview entitlements to account % (account_id=%); refreshed % existing CV(s).',
        target_email, target_account_id, updated_cv_count;
END;
$grant$;

COMMIT;
