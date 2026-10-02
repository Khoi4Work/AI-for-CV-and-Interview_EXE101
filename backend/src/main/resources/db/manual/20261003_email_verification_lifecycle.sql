-- Apply BEFORE deploying the email verification/resend code (ddl-auto=none).
-- Manual, idempotent PostgreSQL migration. Does not delete any account.
BEGIN;
ALTER TABLE account ADD COLUMN IF NOT EXISTS verification_expires_at timestamp;
ALTER TABLE account ADD COLUMN IF NOT EXISTS verification_last_sent_at timestamp;
ALTER TABLE account ADD COLUMN IF NOT EXISTS verified_at timestamp;
ALTER TABLE account ADD COLUMN IF NOT EXISTS verification_managed_at timestamp;

-- Old plaintext links are invalidated once; users request a new link from login.
-- Start the two-day retention grace at migration time, never immediately delete legacy accounts.
UPDATE account SET verification_token = NULL, verification_expires_at = NULL,
    verification_last_sent_at = NULL, verification_managed_at = CURRENT_TIMESTAMP
WHERE provider = 'LOCAL' AND status = 'PENDING_VERIFICATION' AND verification_managed_at IS NULL;

CREATE TABLE IF NOT EXISTS verification_mail_outbox (
    id uuid PRIMARY KEY,
    created_at timestamp NOT NULL,
    updated_at timestamp,
    created_by uuid,
    account_id uuid NOT NULL REFERENCES account(id),
    token varchar(255),
    token_hash varchar(64) NOT NULL,
    attempts integer NOT NULL DEFAULT 0,
    next_attempt_at timestamp NOT NULL,
    sent_at timestamp,
    canceled boolean NOT NULL DEFAULT false
);
CREATE INDEX IF NOT EXISTS idx_verification_mail_due ON verification_mail_outbox(next_attempt_at)
    WHERE sent_at IS NULL AND canceled = false;
CREATE INDEX IF NOT EXISTS idx_verification_mail_account ON verification_mail_outbox(account_id);
CREATE INDEX IF NOT EXISTS idx_pending_account_cleanup ON account(verification_managed_at, id)
    WHERE provider = 'LOCAL' AND status = 'PENDING_VERIFICATION';
COMMIT;

-- Optional rollout audit: set AUTH_PENDING_CLEANUP_DRY_RUN=true before starting the app.
-- After reviewing daily aggregate logs, set it to false to enable actual cleanup.
