-- Apply manually to a separate test database first, after backup. Never run via application startup.
-- Revised 2026-10-10: three new tables; quota/JD/company metadata are stored on their existing owner rows.
-- Additive: no CVFeedback conversion, no seeds, no automatic DROP of legacy side tables.
-- Stop backend/workers before applying. Legacy data transfers only when adding the new owner column.
-- Legacy side tables remain intact; application code no longer reads or writes them.
BEGIN;
DO $$ DECLARE transfer_needed boolean; BEGIN
 transfer_needed := NOT EXISTS(SELECT 1 FROM pg_attribute WHERE attrelid='job_descriptions'::regclass
  AND attname='normalization_metadata' AND NOT attisdropped);
 ALTER TABLE job_descriptions
 ADD COLUMN IF NOT EXISTS normalization_metadata jsonb,
 ADD COLUMN IF NOT EXISTS normalization_hash varchar(64),
 ADD COLUMN IF NOT EXISTS normalization_version varchar(80),
 ADD COLUMN IF NOT EXISTS extraction_status varchar(24) NOT NULL DEFAULT 'IDLE',
 ADD COLUMN IF NOT EXISTS extraction_lease_until timestamp,
 ADD COLUMN IF NOT EXISTS extraction_claim_token uuid;
 IF transfer_needed AND to_regclass('jd_normalization_metadata') IS NOT NULL THEN
  EXECUTE 'UPDATE job_descriptions j SET normalization_metadata=m.metadata, normalization_hash=m.input_hash,
           normalization_version=m.version, extraction_status=m.extraction_status,
           extraction_lease_until=m.lease_until, extraction_claim_token=m.claim_token
           FROM jd_normalization_metadata m WHERE m.jd_id=j.id AND j.normalization_metadata IS NULL';
 END IF;
END $$;
CREATE INDEX IF NOT EXISTS ix_jd_normalized_roles ON job_descriptions USING gin(normalization_metadata jsonb_path_ops);
DO $$ DECLARE transfer_needed boolean; BEGIN
 transfer_needed := NOT EXISTS(SELECT 1 FROM pg_attribute WHERE attrelid='company_info'::regclass
  AND attname='culture_source_url' AND NOT attisdropped);
 ALTER TABLE company_info
 ADD COLUMN IF NOT EXISTS culture_source_url varchar(255),
 ADD COLUMN IF NOT EXISTS culture_reference_date date,
 ADD COLUMN IF NOT EXISTS culture_verified boolean NOT NULL DEFAULT false;
 IF transfer_needed AND to_regclass('company_context_verification') IS NOT NULL THEN
  EXECUTE 'UPDATE company_info c SET culture_source_url=v.source_url, culture_reference_date=v.reference_date,
           culture_verified=v.verified FROM company_context_verification v
           WHERE v.company_id=c.id AND c.culture_source_url IS NULL AND c.culture_reference_date IS NULL
           AND c.culture_verified=false';
 END IF;
END $$;
CREATE TABLE IF NOT EXISTS cv_analyses (
 id uuid PRIMARY KEY, created_at timestamp NOT NULL, updated_at timestamp, created_by uuid,
 gallery_id uuid NOT NULL, account_id uuid NOT NULL, cv_id uuid NOT NULL, jd_id uuid NOT NULL,
 cache_key varchar(64) NOT NULL, status varchar(40) NOT NULL, phase varchar(255),
 rubric_version varchar(255) NOT NULL, extraction_version varchar(255) NOT NULL,
 taxonomy_version varchar(255) NOT NULL, config_version varchar(255) NOT NULL,
 snapshot jsonb NOT NULL, result_json jsonb, score integer CHECK (score BETWEEN 0 AND 100),
 error varchar(255), provider varchar(255), model varchar(255), model_calls integer NOT NULL DEFAULT 0,
 attempt integer NOT NULL DEFAULT 0, lease_until timestamp, internal_analysis boolean NOT NULL DEFAULT false,
 attempt_history jsonb NOT NULL DEFAULT '[]',
 quota_status varchar(24) NOT NULL DEFAULT 'NOT_CHARGED',
 CONSTRAINT ck_cv_analysis_quota_status CHECK(quota_status IN ('NOT_CHARGED','RESERVED','CONSUMED','REFUNDED')),
 UNIQUE(gallery_id, cache_key), CHECK (status <> 'COMPLETED' OR (score IS NOT NULL AND result_json IS NOT NULL))
);
-- Also supports a database that already received the earlier six-table draft.
DO $$ DECLARE transfer_needed boolean; BEGIN
 transfer_needed := NOT EXISTS(SELECT 1 FROM pg_attribute WHERE attrelid='cv_analyses'::regclass
  AND attname='quota_status' AND NOT attisdropped);
 ALTER TABLE cv_analyses ADD COLUMN IF NOT EXISTS quota_status varchar(24) NOT NULL DEFAULT 'NOT_CHARGED';
 IF transfer_needed AND to_regclass('cv_analysis_quota_charges') IS NOT NULL THEN
  EXECUTE 'UPDATE cv_analyses a SET quota_status=c.status FROM cv_analysis_quota_charges c
           WHERE c.analysis_id=a.id AND a.quota_status=''NOT_CHARGED''';
 END IF;
END $$;
DO $$ BEGIN
 IF NOT EXISTS(SELECT 1 FROM pg_constraint WHERE conrelid='cv_analyses'::regclass AND conname='ck_cv_analysis_quota_status') THEN
  ALTER TABLE cv_analyses ADD CONSTRAINT ck_cv_analysis_quota_status
   CHECK(quota_status IN ('NOT_CHARGED','RESERVED','CONSUMED','REFUNDED'));
 END IF;
END $$;
-- Completed input/result cannot be rewritten by later workers or edits.
CREATE OR REPLACE FUNCTION protect_completed_cv_analysis() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
 IF OLD.status='COMPLETED' AND (NEW.snapshot IS DISTINCT FROM OLD.snapshot
    OR NEW.result_json IS DISTINCT FROM OLD.result_json OR NEW.score IS DISTINCT FROM OLD.score
    OR NEW.status IS DISTINCT FROM OLD.status OR NEW.cache_key IS DISTINCT FROM OLD.cache_key
    OR NEW.gallery_id IS DISTINCT FROM OLD.gallery_id OR NEW.account_id IS DISTINCT FROM OLD.account_id
    OR NEW.rubric_version IS DISTINCT FROM OLD.rubric_version OR NEW.extraction_version IS DISTINCT FROM OLD.extraction_version
    OR NEW.taxonomy_version IS DISTINCT FROM OLD.taxonomy_version OR NEW.config_version IS DISTINCT FROM OLD.config_version)
 THEN RAISE EXCEPTION 'Completed CV analysis is immutable'; END IF;
 RETURN NEW;
END $$;
DO $$ BEGIN
 IF NOT EXISTS(SELECT 1 FROM pg_trigger WHERE tgname='protect_completed_cv_analysis_trigger' AND tgrelid='cv_analyses'::regclass) THEN
  CREATE TRIGGER protect_completed_cv_analysis_trigger BEFORE UPDATE ON cv_analyses FOR EACH ROW EXECUTE FUNCTION protect_completed_cv_analysis();
 END IF;
END $$;
CREATE INDEX IF NOT EXISTS ix_cv_analysis_queue ON cv_analyses(status,created_at);
CREATE INDEX IF NOT EXISTS ix_cv_analysis_owner ON cv_analyses(gallery_id,created_at);
CREATE TABLE IF NOT EXISTS cv_analysis_requests (
 id uuid PRIMARY KEY, created_at timestamp NOT NULL, updated_at timestamp, created_by uuid,
 gallery_id uuid NOT NULL, request_key varchar(160) NOT NULL, digest varchar(64) NOT NULL,
 analysis_id uuid NOT NULL REFERENCES cv_analyses(id), UNIQUE(gallery_id,request_key)
);
CREATE TABLE IF NOT EXISTS cv_alternative_jobs (
 id uuid PRIMARY KEY, created_at timestamp NOT NULL, updated_at timestamp, created_by uuid,
 analysis_id uuid NOT NULL UNIQUE REFERENCES cv_analyses(id), status varchar(255) NOT NULL,
 candidate_ids jsonb NOT NULL DEFAULT '[]', analysis_ids jsonb NOT NULL DEFAULT '[]', items jsonb NOT NULL DEFAULT '[]', failed_count integer NOT NULL DEFAULT 0,
 CHECK(jsonb_array_length(candidate_ids)<=5), CHECK(jsonb_array_length(items)<=2)
);
COMMIT;
-- Verify: SELECT to_regclass('cv_analyses'), to_regclass('cv_analysis_requests'), to_regclass('cv_alternative_jobs');
-- Application rollback: set CV_ANALYSIS_ENABLED=false, retain stored analysis tables/history.
-- Do not drop historical analyses or synthesize evidence for legacy feedback.
