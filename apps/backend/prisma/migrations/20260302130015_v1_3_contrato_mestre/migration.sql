/*
  Warnings:

  - A unique constraint covering the columns `[projectId,mes,ano,linhaContratualId]` on the table `receitas_mensais` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `contratoId` to the `projects` table without a default value. This is not possible if the table is not empty.
  - Added the required column `valorPlanejado` to the `receitas_mensais` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "TipoContratacao" AS ENUM ('PJ', 'CL', 'TERCEIRIZADO');

-- DropIndex
DROP INDEX "receitas_mensais_projectId_mes_ano_tipoReceita_key";

-- AlterTable
ALTER TABLE "colaboradores" ADD COLUMN     "tipoContratacao" "TipoContratacao" NOT NULL DEFAULT 'CL';

-- AlterTable
ALTER TABLE "projects" ADD COLUMN     "contratoId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "receitas_mensais" ADD COLUMN     "linhaContratualId" TEXT,
ADD COLUMN     "objetoContratualId" TEXT,
ADD COLUMN     "quantidade" DECIMAL(15,2),
ADD COLUMN     "quantidadePlanejada" DECIMAL(15,2),
ADD COLUMN     "quantidadeRealizada" DECIMAL(15,2),
ADD COLUMN     "unidade" TEXT,
ADD COLUMN     "valorPlanejado" DECIMAL(15,2) NOT NULL,
ADD COLUMN     "valorUnitario" DECIMAL(15,2),
ADD COLUMN     "valorUnitarioPlanejado" DECIMAL(15,2),
ADD COLUMN     "valorUnitarioRealizado" DECIMAL(15,2);

-- CreateTable
CREATE TABLE "contratos" (
    "id" TEXT NOT NULL,
    "nomeContrato" TEXT NOT NULL,
    "cliente" TEXT NOT NULL,
    "numeroContrato" TEXT NOT NULL,
    "dataInicio" TIMESTAMP(3) NOT NULL,
    "dataFim" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'RASCUNHO',
    "observacoes" TEXT,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "contratos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "objetos_contratuais" (
    "id" TEXT NOT NULL,
    "contratoId" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "descricao" TEXT NOT NULL,
    "observacoes" TEXT,
    "dataInicio" TIMESTAMP(3),
    "dataFim" TIMESTAMP(3),
    "valorTotalContratado" DECIMAL(15,2),
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "objetos_contratuais_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "linhas_contratuais" (
    "id" TEXT NOT NULL,
    "objetoContratualId" TEXT NOT NULL,
    "descricaoItem" TEXT NOT NULL,
    "unidade" TEXT NOT NULL,
    "quantidadeAnualEstimada" DECIMAL(15,2) NOT NULL,
    "valorUnitario" DECIMAL(15,2) NOT NULL,
    "valorTotalAnual" DECIMAL(15,2) NOT NULL,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "linhas_contratuais_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "provisoes" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "descricao" TEXT,
    "valor" DECIMAL(15,2) NOT NULL,
    "mes" INTEGER NOT NULL,
    "ano" INTEGER NOT NULL,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "provisoes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "contratos_numeroContrato_key" ON "contratos"("numeroContrato");

-- CreateIndex
CREATE INDEX "contratos_status_idx" ON "contratos"("status");

-- CreateIndex
CREATE INDEX "contratos_cliente_idx" ON "contratos"("cliente");

-- CreateIndex
CREATE INDEX "objetos_contratuais_contratoId_idx" ON "objetos_contratuais"("contratoId");

-- CreateIndex
CREATE UNIQUE INDEX "objetos_contratuais_contratoId_nome_key" ON "objetos_contratuais"("contratoId", "nome");

-- CreateIndex
CREATE INDEX "linhas_contratuais_objetoContratualId_idx" ON "linhas_contratuais"("objetoContratualId");

-- CreateIndex
CREATE INDEX "provisoes_projectId_ano_idx" ON "provisoes"("projectId", "ano");

-- CreateIndex
CREATE UNIQUE INDEX "provisoes_projectId_tipo_mes_ano_key" ON "provisoes"("projectId", "tipo", "mes", "ano");

-- CreateIndex
CREATE INDEX "projects_contratoId_idx" ON "projects"("contratoId");

-- CreateIndex
CREATE INDEX "receitas_mensais_objetoContratualId_idx" ON "receitas_mensais"("objetoContratualId");

-- CreateIndex
CREATE INDEX "receitas_mensais_linhaContratualId_idx" ON "receitas_mensais"("linhaContratualId");

-- CreateIndex
CREATE UNIQUE INDEX "receitas_mensais_projectId_mes_ano_linhaContratualId_key" ON "receitas_mensais"("projectId", "mes", "ano", "linhaContratualId");

-- AddForeignKey
ALTER TABLE "projects" ADD CONSTRAINT "projects_contratoId_fkey" FOREIGN KEY ("contratoId") REFERENCES "contratos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "objetos_contratuais" ADD CONSTRAINT "objetos_contratuais_contratoId_fkey" FOREIGN KEY ("contratoId") REFERENCES "contratos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "linhas_contratuais" ADD CONSTRAINT "linhas_contratuais_objetoContratualId_fkey" FOREIGN KEY ("objetoContratualId") REFERENCES "objetos_contratuais"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "receitas_mensais" ADD CONSTRAINT "receitas_mensais_objetoContratualId_fkey" FOREIGN KEY ("objetoContratualId") REFERENCES "objetos_contratuais"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "receitas_mensais" ADD CONSTRAINT "receitas_mensais_linhaContratualId_fkey" FOREIGN KEY ("linhaContratualId") REFERENCES "linhas_contratuais"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "provisoes" ADD CONSTRAINT "provisoes_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;
