-- Existing question records are left unclassified. The interview question query
-- only selects rows tagged with the requested language, so the service will
-- generate and persist a language-specific question set when needed.
ALTER TABLE questions
    ADD COLUMN IF NOT EXISTS language varchar(5);
