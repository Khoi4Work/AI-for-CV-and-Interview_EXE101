-- Keep personal and curated system JDs in one table while preserving gallery ownership.
BEGIN;

ALTER TABLE job_descriptions
    ADD COLUMN IF NOT EXISTS source varchar(16),
    ADD COLUMN IF NOT EXISTS catalog_key varchar(160),
    ADD COLUMN IF NOT EXISTS industry varchar(120),
    ADD COLUMN IF NOT EXISTS experience_level varchar(80),
    ADD COLUMN IF NOT EXISTS active boolean NOT NULL DEFAULT true;

UPDATE job_descriptions SET source = 'USER' WHERE source IS NULL;
ALTER TABLE job_descriptions ALTER COLUMN source SET DEFAULT 'USER';
ALTER TABLE job_descriptions ALTER COLUMN source SET NOT NULL;
ALTER TABLE job_descriptions ALTER COLUMN gallery_id DROP NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS uk_job_descriptions_catalog_key
    ON job_descriptions (catalog_key);
CREATE INDEX IF NOT EXISTS idx_job_descriptions_source_active
    ON job_descriptions (source, active);

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'ck_job_descriptions_source_scope'
    ) THEN
        ALTER TABLE job_descriptions ADD CONSTRAINT ck_job_descriptions_source_scope CHECK (
            (source = 'USER' AND gallery_id IS NOT NULL AND catalog_key IS NULL)
            OR (source = 'SYSTEM' AND gallery_id IS NULL AND catalog_key IS NOT NULL)
        );
    END IF;
END $$;

-- Migrate the short-lived separate catalog table if its creation script was already run.
DO $$
BEGIN
    IF to_regclass('public.system_job_descriptions') IS NOT NULL THEN
        EXECUTE $migration$
            INSERT INTO job_descriptions (
                id, created_at, updated_at, created_by, gallery_id, source, catalog_key,
                industry, experience_level, active, title, content, company_name, content_hash
            )
            SELECT gen_random_uuid(), created_at, updated_at, created_by, NULL, 'SYSTEM', slug,
                   industry, experience_level, active, title, content, company_name, NULL
            FROM system_job_descriptions
            ON CONFLICT (catalog_key) DO UPDATE SET
                title = EXCLUDED.title,
                content = EXCLUDED.content,
                company_name = EXCLUDED.company_name,
                industry = EXCLUDED.industry,
                experience_level = EXCLUDED.experience_level,
                active = EXCLUDED.active,
                updated_at = NOW()
        $migration$;
        DROP TABLE system_job_descriptions;
    END IF;
END $$;

COMMIT;

-- Add approved/licensed system JDs with the following upsert pattern:
-- INSERT INTO job_descriptions (source, catalog_key, title, company_name, industry, experience_level, content, active)
-- VALUES ('SYSTEM', 'backend-engineer-junior-acme', 'Backend Engineer', 'Acme', 'Software', 'Junior', '<approved JD text>', true)
-- ON CONFLICT (catalog_key) DO UPDATE SET
--     title = EXCLUDED.title,
--     company_name = EXCLUDED.company_name,
--     industry = EXCLUDED.industry,
--     experience_level = EXCLUDED.experience_level,
--     content = EXCLUDED.content,
--     active = EXCLUDED.active,
--     updated_at = NOW();
