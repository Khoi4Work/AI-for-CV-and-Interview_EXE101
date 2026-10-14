-- Run once on PostgreSQL before starting the admin feature (ddl-auto=none).
-- No historical settlement timestamp is inferred from order creation/update time.
BEGIN;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS paid_at timestamp;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS refunded_at timestamp;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS is_test boolean NOT NULL DEFAULT false;
UPDATE orders SET is_test=true WHERE transaction_id LIKE 'TEST-%';
-- Replace Hibernate's old enum check constraints, which do not allow ADMIN.
DO $$ DECLARE c record; BEGIN
    FOR c IN SELECT conname,conrelid::regclass AS tbl FROM pg_constraint
        WHERE contype='c' AND conrelid IN ('account'::regclass,'invitation'::regclass)
        AND pg_get_constraintdef(oid) LIKE '%role%' AND pg_get_constraintdef(oid) LIKE '%ATTENDANCE%'
    LOOP EXECUTE format('ALTER TABLE %s DROP CONSTRAINT %I',c.tbl,c.conname); END LOOP;
END $$;
ALTER TABLE account ADD CONSTRAINT admin_account_role_check CHECK (role IN ('ATTENDANCE','PARTNER','ADMIN'));
ALTER TABLE invitation ADD CONSTRAINT admin_invitation_role_check CHECK (role IN ('ATTENDANCE','PARTNER','ADMIN'));
CREATE UNIQUE INDEX IF NOT EXISTS uq_single_admin ON account(role) WHERE role='ADMIN';
CREATE INDEX IF NOT EXISTS idx_orders_admin_paid_at ON orders(paid_at) WHERE is_test=false;
CREATE INDEX IF NOT EXISTS idx_orders_admin_ordered_at ON orders(ordered_at,id);
COMMIT;
