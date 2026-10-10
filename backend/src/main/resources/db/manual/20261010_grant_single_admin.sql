-- Promote an existing verified account to the single ADMIN role.
-- Set the email below, run 20261010_admin_reporting.sql first. Never sets/resets a password.
DO
$$
    DECLARE
        target_email text := 'yourEmailHere'; target_id uuid;
    BEGIN
        LOCK TABLE account IN SHARE ROW EXCLUSIVE MODE;
        SELECT id INTO target_id FROM account WHERE lower(email) = lower(target_email) AND status = 'ACTIVE';
        IF target_id IS NULL THEN RAISE EXCEPTION 'Target email must belong to an ACTIVE account'; END IF;
        IF EXISTS(SELECT 1 FROM account WHERE role = 'ADMIN' AND id <> target_id) THEN
            RAISE EXCEPTION 'Another admin already exists';
        END IF;
        UPDATE account SET role='ADMIN', updated_at=localtimestamp WHERE id = target_id;
    END
$$;
