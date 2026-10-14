# Database scripts

These scripts are manual. The application does not run them at startup.

- `migrations/` contains schema changes and data backfills tied to application changes. Apply the required migrations in date order to the intended database.
- `data/` contains optional seed/import data. Choose the scripts needed for that environment; seed files are not schema migrations.

For the system JD catalog, apply `migrations/20261005_merge_system_jds_into_job_descriptions.sql` before a JD seed script. To populate the dev catalog with the first FPT IT internships, run `data/20261010_seed_fpt_it_intern_jds.sql`; to add 20 more FPTJobs IT internship roles, run `data/20261010_seed_fpt_it_intern_jds_expanded.sql`. Both seeds are repeatable and use stable `catalog_key` values.

Always verify the database connection before running a script. The FPTJobs records are curated for CV analysis/interview practice; the source listings may have expired and should be checked for current recruiting status.

## Payment event logs

Apply `migrations/20261014_payment_logs.sql` before using the payment event writer. It creates `payment_logs` if missing and indexes order/time queries; existing rows are preserved. The application uses `ddl-auto=none` and does not run this script automatically.

Events are append-only in the application: `CHECKOUT_CREATED`, `PAYMENT_SUCCEEDED`, `PAYMENT_FAILED`, and `WEBHOOK_IGNORED` (a settled or refunded order receives another webhook). Writes share the order/quota transaction, so rollback leaves no committed success event. Invalid signatures, missing data and unknown orders retain server diagnostics only; they cannot create a trusted event attached to an order.

Payloads contain selected reconciliation fields, not webhook signatures, bank-account details or checkout URLs. Events start when this version is deployed; the migration does not backfill invented history. User payment history continues to read `orders`.

To inspect an order, bind its UUID to the query parameter:

```sql
SELECT event_type, created_at, payload
FROM payment_logs
WHERE order_id = :order_id
ORDER BY created_at, id;
```
