-- Run against the application's PostgreSQL database before enabling payment event logging.
-- Existing tables and historical rows are preserved; old payment events are not fabricated.
BEGIN;
CREATE TABLE IF NOT EXISTS payment_logs (
    id uuid PRIMARY KEY,
    created_at timestamp NOT NULL,
    updated_at timestamp,
    created_by uuid,
    order_id uuid NOT NULL REFERENCES orders(id),
    event_type varchar(50) NOT NULL,
    payload jsonb NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_payment_logs_order_created ON payment_logs(order_id, created_at, id);
COMMIT;
