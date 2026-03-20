-- Schema sync hotfix for production log errors.
-- Idempotent statements reduce risk when parts were patched manually.

DO $$
BEGIN
	IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'TipoRecalculo') THEN
		CREATE TYPE "TipoRecalculo" AS ENUM ('IMPOSTO', 'CALENDARIO', 'TAXA_COLABORADOR', 'JORNADA', 'DISSIDIO', 'BULK_UPDATE');
	END IF;
END
$$;

DO $$
BEGIN
	IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'StatusRecalculo') THEN
		CREATE TYPE "StatusRecalculo" AS ENUM ('INICIADO', 'PROCESSANDO', 'CONCLUIDO', 'FALHOU', 'CANCELADO');
	END IF;
END
$$;

ALTER TABLE "projects"
ADD COLUMN IF NOT EXISTS "regimeTributario" TEXT DEFAULT 'SIMPLES_NACIONAL';

ALTER TABLE "colaboradores"
ADD COLUMN IF NOT EXISTS "project_id" TEXT;

ALTER TABLE "linhas_contratuais"
ADD COLUMN IF NOT EXISTS "saldo_quantidade" DECIMAL(15,2) NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS "saldo_valor" DECIMAL(15,2) NOT NULL DEFAULT 0;

ALTER TABLE "contratos"
ADD COLUMN IF NOT EXISTS "saldo_contratual" DECIMAL(15,2) NOT NULL DEFAULT 0;

ALTER TABLE "sindicatos"
ADD COLUMN IF NOT EXISTS "sigla" TEXT,
ADD COLUMN IF NOT EXISTS "contacto" TEXT,
ADD COLUMN IF NOT EXISTS "telefone" TEXT,
ADD COLUMN IF NOT EXISTS "email" TEXT,
ADD COLUMN IF NOT EXISTS "observacoes" TEXT,
ADD COLUMN IF NOT EXISTS "criadoPor" TEXT;

ALTER TABLE "sindicatos"
ALTER COLUMN "regimeTributario" DROP NOT NULL;

ALTER TABLE "calendarios"
ADD COLUMN IF NOT EXISTS "nome" TEXT NOT NULL DEFAULT 'Feriado',
ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN IF NOT EXISTS "ehFeriado" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN IF NOT EXISTS "ehRecuperavel" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN IF NOT EXISTS "percentualDesc" DECIMAL(5,2) NOT NULL DEFAULT 100,
ADD COLUMN IF NOT EXISTS "observacoes" TEXT,
ADD COLUMN IF NOT EXISTS "criadoPor" TEXT,
ADD COLUMN IF NOT EXISTS "ativo" BOOLEAN NOT NULL DEFAULT true;

CREATE TABLE IF NOT EXISTS "aliquotas_regime" (
	"id" TEXT NOT NULL,
	"regime" TEXT NOT NULL,
	"tipo" TEXT NOT NULL,
	"aliquota" DECIMAL(8,6) NOT NULL,
	"ativo" BOOLEAN NOT NULL DEFAULT true,
	"createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
	"updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT "aliquotas_regime_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "historico_recalculos" (
	"id" TEXT NOT NULL,
	"tipo" "TipoRecalculo" NOT NULL,
	"entidadeId" TEXT NOT NULL,
	"entidadeTipo" TEXT NOT NULL,
	"usuarioId" TEXT NOT NULL,
	"dataInicio" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
	"dataFim" TIMESTAMP(3),
	"status" "StatusRecalculo" NOT NULL,
	"totalAfetados" INTEGER NOT NULL DEFAULT 0,
	"processados" INTEGER NOT NULL DEFAULT 0,
	"erros" INTEGER NOT NULL DEFAULT 0,
	"detalhes" JSONB NOT NULL,
	"mensagemErro" TEXT,
	"createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
	"updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT "historico_recalculos_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "project_status_reports" (
	"id" TEXT NOT NULL,
	"projectId" TEXT NOT NULL,
	"status" TEXT NOT NULL,
	"gargalo" TEXT,
	"detalheGargalo" TEXT,
	"acaoCLevel" TEXT,
	"responsavel" TEXT,
	"vigente" BOOLEAN NOT NULL DEFAULT true,
	"dataReport" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
	"createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
	"updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT "project_status_reports_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "project_go_lives" (
	"id" TEXT NOT NULL,
	"projectId" TEXT NOT NULL,
	"dataGoLive" TIMESTAMP(3) NOT NULL,
	"descricao" TEXT,
	"concluido" BOOLEAN NOT NULL DEFAULT false,
	"createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
	"updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT "project_go_lives_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "aliquotas_regime_regime_tipo_key"
ON "aliquotas_regime" ("regime", "tipo");

CREATE INDEX IF NOT EXISTS "historico_recalculos_tipo_status_idx"
ON "historico_recalculos" ("tipo", "status");

CREATE INDEX IF NOT EXISTS "historico_recalculos_usuarioId_idx"
ON "historico_recalculos" ("usuarioId");

CREATE INDEX IF NOT EXISTS "historico_recalculos_createdAt_idx"
ON "historico_recalculos" ("createdAt");

CREATE INDEX IF NOT EXISTS "project_status_reports_projectId_vigente_idx"
ON "project_status_reports" ("projectId", "vigente");

CREATE INDEX IF NOT EXISTS "project_status_reports_status_idx"
ON "project_status_reports" ("status");

CREATE INDEX IF NOT EXISTS "project_status_reports_dataReport_idx"
ON "project_status_reports" ("dataReport");

CREATE INDEX IF NOT EXISTS "project_go_lives_projectId_idx"
ON "project_go_lives" ("projectId");

CREATE INDEX IF NOT EXISTS "project_go_lives_dataGoLive_idx"
ON "project_go_lives" ("dataGoLive");

CREATE INDEX IF NOT EXISTS "colaboradores_project_id_idx"
ON "colaboradores" ("project_id");

DO $$
BEGIN
	IF NOT EXISTS (
		SELECT 1
		FROM pg_constraint
		WHERE conname = 'colaboradores_project_id_fkey'
	) THEN
		ALTER TABLE "colaboradores"
		ADD CONSTRAINT "colaboradores_project_id_fkey"
		FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE SET NULL ON UPDATE CASCADE;
	END IF;
END
$$;

DO $$
BEGIN
	IF NOT EXISTS (
		SELECT 1
		FROM pg_constraint
		WHERE conname = 'historico_recalculos_usuarioId_fkey'
	) THEN
		ALTER TABLE "historico_recalculos"
		ADD CONSTRAINT "historico_recalculos_usuarioId_fkey"
		FOREIGN KEY ("usuarioId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
	END IF;
END
$$;

DO $$
BEGIN
	IF NOT EXISTS (
		SELECT 1
		FROM pg_constraint
		WHERE conname = 'project_status_reports_projectId_fkey'
	) THEN
		ALTER TABLE "project_status_reports"
		ADD CONSTRAINT "project_status_reports_projectId_fkey"
		FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;
	END IF;
END
$$;

DO $$
BEGIN
	IF NOT EXISTS (
		SELECT 1
		FROM pg_constraint
		WHERE conname = 'project_go_lives_projectId_fkey'
	) THEN
		ALTER TABLE "project_go_lives"
		ADD CONSTRAINT "project_go_lives_projectId_fkey"
		FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;
	END IF;
END
$$;
