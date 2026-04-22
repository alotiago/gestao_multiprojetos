-- CreateTable: tipos_despesa
CREATE TABLE IF NOT EXISTS "tipos_despesa" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "descricao" TEXT,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tipos_despesa_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "tipos_despesa_nome_key" ON "tipos_despesa"("nome");

-- CreateTable: fornecedores
CREATE TABLE IF NOT EXISTS "fornecedores" (
    "id" TEXT NOT NULL,
    "cnpj" TEXT NOT NULL,
    "razaoSocial" TEXT NOT NULL,
    "nomeFantasia" TEXT,
    "endereco" TEXT,
    "cidade" TEXT,
    "uf" TEXT,
    "cep" TEXT,
    "telefone" TEXT,
    "email" TEXT,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "fornecedores_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "fornecedores_cnpj_key" ON "fornecedores"("cnpj");

-- AlterTable: despesas - add fornecedor fields
ALTER TABLE "despesas" ADD COLUMN IF NOT EXISTS "fornecedorId" TEXT;
ALTER TABLE "despesas" ADD COLUMN IF NOT EXISTS "dataVencimento" TIMESTAMP(3);
ALTER TABLE "despesas" ADD COLUMN IF NOT EXISTS "anexoUrl" TEXT;

-- AddForeignKey
DO $$ BEGIN
    ALTER TABLE "despesas" ADD CONSTRAINT "despesas_fornecedorId_fkey" FOREIGN KEY ("fornecedorId") REFERENCES "fornecedores"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Seed: tipos_despesa com valores padrão do enum existente
INSERT INTO "tipos_despesa" ("id", "nome", "descricao", "ativo", "createdAt", "updatedAt")
VALUES
  (gen_random_uuid()::text, 'comerciais', 'Despesas comerciais', true, NOW(), NOW()),
  (gen_random_uuid()::text, 'operacao', 'Despesas de operação', true, NOW(), NOW()),
  (gen_random_uuid()::text, 'taxas', 'Taxas diversas', true, NOW(), NOW()),
  (gen_random_uuid()::text, 'administrativas', 'Despesas administrativas', true, NOW(), NOW()),
  (gen_random_uuid()::text, 'software', 'Licenças e softwares', true, NOW(), NOW()),
  (gen_random_uuid()::text, 'tributarias', 'Despesas tributárias', true, NOW(), NOW()),
  (gen_random_uuid()::text, 'financeiras', 'Despesas financeiras', true, NOW(), NOW()),
  (gen_random_uuid()::text, 'facilities', 'Facilities', true, NOW(), NOW()),
  (gen_random_uuid()::text, 'fornecedor', 'Pagamentos a fornecedores', true, NOW(), NOW()),
  (gen_random_uuid()::text, 'aluguel', 'Aluguel e locações', true, NOW(), NOW()),
  (gen_random_uuid()::text, 'endomarketing', 'Endomarketing', true, NOW(), NOW()),
  (gen_random_uuid()::text, 'amortizacao', 'Amortizações', true, NOW(), NOW()),
  (gen_random_uuid()::text, 'rateio', 'Rateios', true, NOW(), NOW()),
  (gen_random_uuid()::text, 'provisao', 'Provisões', true, NOW(), NOW()),
  (gen_random_uuid()::text, 'outros', 'Outras despesas', true, NOW(), NOW())
ON CONFLICT ("nome") DO NOTHING;
