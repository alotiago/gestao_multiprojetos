-- Hotfix migration: add missing contratos.saldo_contratual column
-- Uses IF NOT EXISTS to be safe on environments already patched manually.
ALTER TABLE "contratos"
ADD COLUMN IF NOT EXISTS "saldo_contratual" DECIMAL(15,2) NOT NULL DEFAULT 0;
