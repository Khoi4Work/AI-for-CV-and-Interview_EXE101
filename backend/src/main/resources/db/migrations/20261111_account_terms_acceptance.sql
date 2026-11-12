-- Record the Terms version accepted when a new account is created.
-- Existing accounts intentionally remain NULL; this does not invent historical consent.
ALTER TABLE account
    ADD COLUMN IF NOT EXISTS terms_version varchar(32),
    ADD COLUMN IF NOT EXISTS terms_accepted_at timestamp;
