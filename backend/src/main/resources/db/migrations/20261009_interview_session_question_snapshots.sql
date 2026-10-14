-- Apply manually after checking the existing schema. No data is removed.
-- Personalized question IDs belong to interview_sessions.context_snapshot rather than shared questions.
-- Keep the session FK and every unrelated constraint. Only remove a legacy question_id -> questions FK.
BEGIN;
ALTER TABLE interview_sessions
 ADD COLUMN IF NOT EXISTS context_snapshot jsonb NOT NULL DEFAULT '{}'::jsonb;
DO $$
DECLARE legacy_fk record;
BEGIN
 IF to_regclass('interview_answers') IS NOT NULL AND to_regclass('questions') IS NOT NULL THEN
  FOR legacy_fk IN
   SELECT c.conname
   FROM pg_constraint c
   JOIN pg_attribute a ON a.attrelid=c.conrelid AND a.attnum=c.conkey[1]
   WHERE c.contype='f'
     AND c.conrelid='interview_answers'::regclass
     AND c.confrelid='questions'::regclass
     AND array_length(c.conkey,1)=1 AND a.attname='question_id'
  LOOP
   EXECUTE format('ALTER TABLE interview_answers DROP CONSTRAINT %I',legacy_fk.conname);
  END LOOP;
 END IF;
END $$;
COMMIT;
-- Application enforces that the question ID exists in the caller-owned session snapshot before saving an answer.
-- Existing shared-bank questions and historic answers remain intact.
