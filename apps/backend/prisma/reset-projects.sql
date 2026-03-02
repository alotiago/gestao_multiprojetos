-- Script para zerar a tabela de projetos e reiniciar sequences
-- Uso: psql -U seu_usuario -d gestorprojetos -f reset-projects.sql

BEGIN;

-- Deletar todas as receitas mensais (dependências)
DELETE FROM "ReceitaMensal";

-- Deletar todos os projetos
DELETE FROM "Project";

-- Reiniciar a sequence de IDs (se houver)
-- Nota: Prisma usa UUIDs por padrão, então não há sequence de IDs
-- Mas se usarmos código como "BR-001", podemos querer resetar contadores

-- Verificar resultado
SELECT 
  'Projetos deletados' as tabela,
  COUNT(*) as registros_restantes
FROM "Project"
UNION ALL
SELECT 
  'Receitas deletadas' as tabela,
  COUNT(*) as registros_restantes
FROM "ReceitaMensal";

COMMIT;

-- Mensagem de sucesso
\echo 'Tabela de projetos zerada com sucesso!'
