# Database scripts

These scripts are manual. The application does not run them at startup.

- `migrations/` contains schema changes and data backfills tied to application changes. Apply the required migrations in date order to the intended database.
- `data/` contains optional seed/import data. Choose the scripts needed for that environment; seed files are not schema migrations.

For the system JD catalog, apply `migrations/20261005_merge_system_jds_into_job_descriptions.sql` before a JD seed script. To populate the dev catalog with the first FPT IT internships, run `data/20261010_seed_fpt_it_intern_jds.sql`; to add 20 more FPTJobs IT internship roles, run `data/20261010_seed_fpt_it_intern_jds_expanded.sql`. Both seeds are repeatable and use stable `catalog_key` values.

Always verify the database connection before running a script. The FPTJobs records are curated for CV analysis/interview practice; the source listings may have expired and should be checked for current recruiting status.
