-- Add cost nature to despesas and justification to receitas.
-- Idempotent migration for PostgreSQL.

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'NaturezaCusto') THEN
    CREATE TYPE "NaturezaCusto" AS ENUM ('FIXO', 'VARIAVEL');
  END IF;
END
$$;

ALTER TABLE "despesas"
ADD COLUMN IF NOT EXISTS "naturezaCusto" "NaturezaCusto" NOT NULL DEFAULT 'VARIAVEL';

ALTER TABLE "receitas_mensais"
ADD COLUMN IF NOT EXISTS "justificativa" TEXT;
