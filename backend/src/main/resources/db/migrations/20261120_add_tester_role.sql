-- Apply after the admin reporting migration and before deploying the TESTER role.
BEGIN;

ALTER TABLE account DROP CONSTRAINT IF EXISTS admin_account_role_check;
ALTER TABLE account ADD CONSTRAINT tester_account_role_check
    CHECK (role IN ('ATTENDANCE','PARTNER','ADMIN','TESTER'));

-- Keep transactions created before tester role assignment out of real payment reports.
UPDATE orders o
SET is_test=true
FROM account a
WHERE a.id=o.account_id AND a.role='TESTER';

COMMIT;
