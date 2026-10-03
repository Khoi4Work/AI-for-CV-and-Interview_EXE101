-- PostgreSQL development fixture for /pricing payment history.
-- Run the whole script in IntelliJ SQL Console connected to your development DB.
-- Requires the existing ACTIVE account and the paid service catalog.
-- Adds 12 demo orders; running again does not duplicate or overwrite orders.
-- Does not contact PayOS, activate subscriptions, change quotas or issue real invoices.

BEGIN;

DO $seed$
DECLARE
    target_email text := 'babykizzed@gmail.com';
    account_uuid uuid;
    order_uuid uuid;
    service_uuid uuid;
    service_price numeric;
    category_name text;
    package_name text;
    payment_state text;
    order_state text;
    event_time timestamp;
    local_now timestamp := CURRENT_TIMESTAMP AT TIME ZONE 'Asia/Ho_Chi_Minh';
    states text[] := ARRAY['PAID', 'PENDING', 'FAILED', 'REFUNDED'];
    i integer;
BEGIN
    SELECT id INTO STRICT account_uuid FROM account
    WHERE lower(email) = lower(trim(target_email)) AND status = 'ACTIVE';

    FOR i IN 1..12 LOOP
        category_name := CASE WHEN i % 2 = 1 THEN 'CV' ELSE 'INTERVIEW' END;
        package_name := CASE WHEN ((i - 1) / 2) % 2 = 0 THEN 'MIDDLE' ELSE 'ENHANCE' END;
        SELECT id, price INTO service_uuid, service_price FROM payment_services
        WHERE category = category_name AND package_code = package_name
        ORDER BY id LIMIT 1;
        IF service_uuid IS NULL THEN
            RAISE EXCEPTION 'Missing payment service: % %. Run the payment catalog initialization first.',
                category_name, package_name;
        END IF;

        payment_state := states[1 + (i - 1) % 4];
        order_state := CASE payment_state
            WHEN 'PENDING' THEN 'PENDING'
            WHEN 'FAILED' THEN 'FAILED'
            ELSE 'COMPLETED'
        END;
        event_time := local_now - (i - 1) * interval '1 day';
        order_uuid := md5(account_uuid::text || ':payment-history-fixture-v1:order:' || i)::uuid;

        INSERT INTO orders (
            id, account_id, service_id, amount, status, payment_status, payment_method,
            transaction_id, checkout_url, ordered_at, created_at, updated_at, created_by
        ) VALUES (
            order_uuid, account_uuid, service_uuid, service_price, order_state, payment_state,
            'BANK_TRANSFER', 'TEST-' || order_uuid::text, NULL,
            event_time, event_time, event_time, account_uuid
        ) ON CONFLICT (id) DO NOTHING;
    END LOOP;
    RAISE NOTICE 'Payment history fixtures ready for %: 12 orders (3 per payment status). No real payment or quota change.', target_email;
END
$seed$;

COMMIT;
