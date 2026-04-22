-- CreateTable: aliquotas_regime
CREATE TABLE IF NOT EXISTS "aliquotas_regime" (
    "id" TEXT NOT NULL,
    "regime" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "aliquota" DECIMAL(8,6) NOT NULL,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "aliquotas_regime_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "aliquotas_regime_regime_tipo_key" ON "aliquotas_regime"("regime", "tipo");
