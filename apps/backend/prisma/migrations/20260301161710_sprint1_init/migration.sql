-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('ADMIN', 'PMO', 'PROJECT_MANAGER', 'HR', 'FINANCE', 'VIEWER');

-- CreateEnum
CREATE TYPE "ProjectStatus" AS ENUM ('ATIVO', 'SUSPENSO', 'ENCERRADO');

-- CreateEnum
CREATE TYPE "UserStatus" AS ENUM ('ATIVO', 'INATIVO', 'DESLIGADO');

-- CreateEnum
CREATE TYPE "FeriadoType" AS ENUM ('NACIONAL', 'ESTADUAL', 'MUNICIPAL');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" "UserRole" NOT NULL DEFAULT 'VIEWER',
    "status" "UserStatus" NOT NULL DEFAULT 'ATIVO',
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "lastLogin" TIMESTAMP(3),

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "roles" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "permissions" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "roles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "units" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "units_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "projects" (
    "id" TEXT NOT NULL,
    "codigo" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "cliente" TEXT NOT NULL,
    "unitId" TEXT NOT NULL,
    "status" "ProjectStatus" NOT NULL DEFAULT 'ATIVO',
    "tipo" TEXT NOT NULL,
    "dataInicio" TIMESTAMP(3) NOT NULL,
    "dataFim" TIMESTAMP(3),
    "descricao" TEXT,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "criadoPor" TEXT,

    CONSTRAINT "projects_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "project_users" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "dataAlocacao" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "project_users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "receitas_mensais" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "mes" INTEGER NOT NULL,
    "ano" INTEGER NOT NULL,
    "tipoReceita" TEXT NOT NULL,
    "descricao" TEXT,
    "valorPrevisto" DECIMAL(15,2) NOT NULL,
    "valorRealizado" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "receitas_mensais_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "colaboradores" (
    "id" TEXT NOT NULL,
    "matricula" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "email" TEXT,
    "cargo" TEXT NOT NULL,
    "classe" TEXT,
    "taxaHora" DECIMAL(10,2) NOT NULL,
    "cargaHoraria" INTEGER NOT NULL,
    "cidade" TEXT NOT NULL,
    "estado" TEXT NOT NULL,
    "sindicatoId" TEXT,
    "status" "UserStatus" NOT NULL DEFAULT 'ATIVO',
    "dataAdmissao" TIMESTAMP(3) NOT NULL,
    "dataDesligamento" TIMESTAMP(3),
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "colaboradores_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "jornadas" (
    "id" TEXT NOT NULL,
    "colaboradorId" TEXT NOT NULL,
    "projectId" TEXT,
    "mes" INTEGER NOT NULL,
    "ano" INTEGER NOT NULL,
    "horasPrevistas" DECIMAL(10,2) NOT NULL,
    "horasRealizadas" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "fte" DECIMAL(5,2) NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "jornadas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ferias" (
    "id" TEXT NOT NULL,
    "colaboradorId" TEXT NOT NULL,
    "dataInicio" TIMESTAMP(3) NOT NULL,
    "dataFim" TIMESTAMP(3) NOT NULL,
    "dias" INTEGER NOT NULL,
    "aprovado" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ferias_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "desligamentos" (
    "id" TEXT NOT NULL,
    "colaboradorId" TEXT NOT NULL,
    "dataDesligamento" TIMESTAMP(3) NOT NULL,
    "motivo" TEXT NOT NULL,
    "observacoes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "desligamentos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "custos_mensais" (
    "id" TEXT NOT NULL,
    "colaboradorId" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "mes" INTEGER NOT NULL,
    "ano" INTEGER NOT NULL,
    "custoFixo" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "custoVariavel" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "custos_mensais_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "despesas" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "descricao" TEXT NOT NULL,
    "valor" DECIMAL(15,2) NOT NULL,
    "mes" INTEGER NOT NULL,
    "ano" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "despesas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "impostos" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "aliquota" DECIMAL(8,4) NOT NULL,
    "valor" DECIMAL(15,2) NOT NULL,
    "mes" INTEGER NOT NULL,
    "ano" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "impostos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sindicatos" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "regiao" TEXT NOT NULL,
    "percentualDissidio" DECIMAL(8,4) NOT NULL DEFAULT 0,
    "dataDissidio" TIMESTAMP(3),
    "regimeTributario" TEXT NOT NULL,
    "descricao" TEXT,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sindicatos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "calendarios" (
    "id" TEXT NOT NULL,
    "data" TIMESTAMP(3) NOT NULL,
    "tipoFeriado" "FeriadoType" NOT NULL,
    "descricao" TEXT NOT NULL,
    "cidade" TEXT,
    "estado" TEXT,
    "diaSemana" INTEGER NOT NULL,
    "nacional" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "calendarios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "indices_financeiros" (
    "id" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "valor" DECIMAL(10,4) NOT NULL,
    "mesReferencia" INTEGER NOT NULL,
    "anoReferencia" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "indices_financeiros_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "historicos_calculo" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "dadosAntes" JSONB NOT NULL,
    "dadosDepois" JSONB NOT NULL,
    "criadoPor" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "historicos_calculo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "acao" TEXT NOT NULL,
    "entidade" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "dadosAntes" JSONB,
    "dadosDepois" JSONB,
    "detalhes" TEXT,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "refresh_token_sessions" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "revokedAt" TIMESTAMP(3),
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "refresh_token_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_email_idx" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_role_idx" ON "users"("role");

-- CreateIndex
CREATE UNIQUE INDEX "roles_name_key" ON "roles"("name");

-- CreateIndex
CREATE UNIQUE INDEX "units_code_key" ON "units"("code");

-- CreateIndex
CREATE UNIQUE INDEX "projects_codigo_key" ON "projects"("codigo");

-- CreateIndex
CREATE INDEX "projects_unitId_idx" ON "projects"("unitId");

-- CreateIndex
CREATE INDEX "projects_status_idx" ON "projects"("status");

-- CreateIndex
CREATE INDEX "projects_codigo_idx" ON "projects"("codigo");

-- CreateIndex
CREATE UNIQUE INDEX "project_users_userId_projectId_key" ON "project_users"("userId", "projectId");

-- CreateIndex
CREATE INDEX "receitas_mensais_projectId_ano_idx" ON "receitas_mensais"("projectId", "ano");

-- CreateIndex
CREATE UNIQUE INDEX "receitas_mensais_projectId_mes_ano_tipoReceita_key" ON "receitas_mensais"("projectId", "mes", "ano", "tipoReceita");

-- CreateIndex
CREATE UNIQUE INDEX "colaboradores_matricula_key" ON "colaboradores"("matricula");

-- CreateIndex
CREATE UNIQUE INDEX "colaboradores_email_key" ON "colaboradores"("email");

-- CreateIndex
CREATE INDEX "colaboradores_status_idx" ON "colaboradores"("status");

-- CreateIndex
CREATE INDEX "colaboradores_sindicatoId_idx" ON "colaboradores"("sindicatoId");

-- CreateIndex
CREATE UNIQUE INDEX "jornadas_colaboradorId_mes_ano_key" ON "jornadas"("colaboradorId", "mes", "ano");

-- CreateIndex
CREATE UNIQUE INDEX "desligamentos_colaboradorId_key" ON "desligamentos"("colaboradorId");

-- CreateIndex
CREATE INDEX "custos_mensais_projectId_ano_idx" ON "custos_mensais"("projectId", "ano");

-- CreateIndex
CREATE INDEX "custos_mensais_colaboradorId_idx" ON "custos_mensais"("colaboradorId");

-- CreateIndex
CREATE UNIQUE INDEX "custos_mensais_colaboradorId_projectId_mes_ano_key" ON "custos_mensais"("colaboradorId", "projectId", "mes", "ano");

-- CreateIndex
CREATE INDEX "despesas_projectId_ano_idx" ON "despesas"("projectId", "ano");

-- CreateIndex
CREATE INDEX "impostos_projectId_tipo_idx" ON "impostos"("projectId", "tipo");

-- CreateIndex
CREATE UNIQUE INDEX "sindicatos_nome_key" ON "sindicatos"("nome");

-- CreateIndex
CREATE INDEX "sindicatos_regiao_idx" ON "sindicatos"("regiao");

-- CreateIndex
CREATE INDEX "calendarios_data_idx" ON "calendarios"("data");

-- CreateIndex
CREATE INDEX "calendarios_estado_idx" ON "calendarios"("estado");

-- CreateIndex
CREATE UNIQUE INDEX "calendarios_data_tipoFeriado_cidade_estado_key" ON "calendarios"("data", "tipoFeriado", "cidade", "estado");

-- CreateIndex
CREATE UNIQUE INDEX "indices_financeiros_tipo_mesReferencia_anoReferencia_key" ON "indices_financeiros"("tipo", "mesReferencia", "anoReferencia");

-- CreateIndex
CREATE INDEX "historicos_calculo_projectId_idx" ON "historicos_calculo"("projectId");

-- CreateIndex
CREATE INDEX "audit_logs_userId_idx" ON "audit_logs"("userId");

-- CreateIndex
CREATE INDEX "audit_logs_entidade_idx" ON "audit_logs"("entidade");

-- CreateIndex
CREATE INDEX "audit_logs_createdAt_idx" ON "audit_logs"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "refresh_token_sessions_token_key" ON "refresh_token_sessions"("token");

-- CreateIndex
CREATE INDEX "refresh_token_sessions_userId_idx" ON "refresh_token_sessions"("userId");

-- CreateIndex
CREATE INDEX "refresh_token_sessions_expiresAt_idx" ON "refresh_token_sessions"("expiresAt");

-- AddForeignKey
ALTER TABLE "projects" ADD CONSTRAINT "projects_unitId_fkey" FOREIGN KEY ("unitId") REFERENCES "units"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_users" ADD CONSTRAINT "project_users_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_users" ADD CONSTRAINT "project_users_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "receitas_mensais" ADD CONSTRAINT "receitas_mensais_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "colaboradores" ADD CONSTRAINT "colaboradores_sindicatoId_fkey" FOREIGN KEY ("sindicatoId") REFERENCES "sindicatos"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "jornadas" ADD CONSTRAINT "jornadas_colaboradorId_fkey" FOREIGN KEY ("colaboradorId") REFERENCES "colaboradores"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ferias" ADD CONSTRAINT "ferias_colaboradorId_fkey" FOREIGN KEY ("colaboradorId") REFERENCES "colaboradores"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "desligamentos" ADD CONSTRAINT "desligamentos_colaboradorId_fkey" FOREIGN KEY ("colaboradorId") REFERENCES "colaboradores"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "custos_mensais" ADD CONSTRAINT "custos_mensais_colaboradorId_fkey" FOREIGN KEY ("colaboradorId") REFERENCES "colaboradores"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "custos_mensais" ADD CONSTRAINT "custos_mensais_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "despesas" ADD CONSTRAINT "despesas_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "impostos" ADD CONSTRAINT "impostos_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "historicos_calculo" ADD CONSTRAINT "historicos_calculo_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
