# PLANO SPRINT 6 - Calendários & Sindicatos

**Data Planejada:** 04-24 de Março de 2026  
**Duração:** 2.5 semanas (10 dias úteis)  
**Story Points:** ~55  
**Objetivo:** Gestão regional com impacto em jornadas e custos

---

## 🎯 Objetivo Geral

Implementar sistema de calendários (feriados) e sindicatos (regras trabalhistas) com motor automático que integra ambos para recalcular jornadas, horas, custos e FTE por região.

---

## 📋 Backlog Detalhado

### 1. CRUD Calendários (2.5 dias)

#### 1.1 Schema Prisma
**Tarefa:** Adicionar modelo `Calendario` ao schema.prisma

```prisma
model Calendario {
  id            String @id @default(cuid())
  tipo          String // "FERIADO", "PONT", "FOLGA"
  data          DateTime
  nome          String // Ex: "Carnaval", "Corpus Christi"
  descricao     String?
  estado        String? // "SP", "RJ", null = nacional
  municipio     String?
  
  ehFeriado     Boolean @default(true)
  ehRecuperavel Boolean @default(false)
  percentualDesc Decimal @db.Decimal(5, 2) @default(100) // 100% = dia inteiro
  
  observacoes   String?
  criadoPor     String?
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
  
  @@map("calendarios")
  @@index([data, estado])
  @@unique([data, estado, municipio])
}
```

**Arquivo:** `apps/backend/prisma/schema.prisma`  
**Tempo:** 30 min

---

#### 1.2 DTOs
**Tarefa:** Criar DTOs para Calendario

**Arquivo:** `apps/backend/src/modules/calendario/dto/calendario.dto.ts`

```typescript
export class CreateCalendarioDto {
  @IsString() @IsNotEmpty() tipo!: string;
  @IsDateString() data!: string;
  @IsString() @IsNotEmpty() nome!: string;
  @IsString() @IsOptional() descricao?: string;
  @IsString() @IsOptional() estado?: string; // null = nacional
  @IsString() @IsOptional() municipio?: string;
  @IsBoolean() @IsOptional() ehFeriado?: boolean;
  @IsBoolean() @IsOptional() ehRecuperavel?: boolean;
  @IsNumber() @IsOptional() percentualDesc?: number; // 0-100
}

export class UpdateCalendarioDto {
  @IsString() @IsOptional() nome?: string;
  @IsString() @IsOptional() descricao?: string;
  @IsBoolean() @IsOptional() ehRecuperavel?: boolean;
  @IsNumber() @IsOptional() percentualDesc?: number;
}

export class ListarCalendariosDto {
  ano?: number;
  mes?: number;
  estado?: string;
  municipio?: string;
  tipo?: string;
}
```

**Tempo:** 45 min

---

#### 1.3 Service - CalendarioService
**Tarefa:** Implementar CalendarioService

**Métodos:**
- `criarFeriado()` - Criar novo feriado
- `listarFeriados()` - Listar com filtros (ano, estado, etc)
- `buscarFeriadosPorPeriodo()` - Feriados entre duas datas
- `atualizarFeriado()` - Atualizar feriado
- `deletarFeriado()` - Soft delete
- `validarDiaÉFeriado()` - Verificar se uma data é feriado
- `calcularDiasUteisEmPeriodo()` - Calcular dias úteis entre datas
- `importarFeriadosEmLote()` - Bulk import de feriados (CSV/JSON)

**Arquivo:** `apps/backend/src/modules/calendario/calendario.service.ts`  
**Tempo:** 2 horas

---

#### 1.4 Controller - CalendarioController
**Tarefa:** Criar endpoints REST para Calendario

**Endpoints:**
```
GET    /calendario                    # Listar feriados (com filtros)
POST   /calendario                    # Criar feriado
GET    /calendario/:id                # Buscar por ID
PUT    /calendario/:id                # Atualizar
DELETE /calendario/:id                # Soft delete
GET    /calendario/periodo/:inicio/:fim  # Feriados em período
POST   /calendario/import/bulk        # Bulk import
GET    /calendario/dias-uteis         # Calcular dias úteis
GET    /calendario/valida-dia/:data   # É feriado?
```

**Arquivo:** `apps/backend/src/modules/calendario/calendario.controller.ts`  
**Tempo:** 1.5 horas

---

#### 1.5 Testes Calendario
**Tarefa:** Escrever 12 testes unitários

**Cobertura:**
- ✅ Criar feriado nacional
- ✅ Criar feriado estadual
- ✅ Atualizar feriado
- ✅ Listar feriados com filtros
- ✅ Calcular dias úteis (sem feriados)
- ✅ Importar feriados em lote
- ✅ Validar erros (data duplicada, etc)
- ✅ Soft delete
- ✅ E mais...

**Arquivo:** `apps/backend/src/modules/calendario/calendario.service.spec.ts`  
**Tempo:** 1.5 horas

---

### 2. CRUD Sindicatos (2.5 dias)

#### 2.1 Schema Prisma
**Tarefa:** Expandir modelo `Sindicato` no schema.prisma

```prisma
model Sindicato {
  id                  String @id @default(cuid())
  nome                String @unique
  sigla               String? @unique
  regiao              String  // "SP", "RJ", "Nacional", etc
  
  // Dados trabalhistas
  percentualDissidio  Decimal @db.Decimal(8, 4) @default(0)
  dataDissidio        DateTime?
  regimeTributario    String? // LUCRO_REAL, LUCRO_PRESUMIDO, SIMPLES_NACIONAL, CPRB
  
  // Contato
  contacto            String?
  telefone            String?
  email               String?
  
  // Observações
  observacoes         String?
  ativo               Boolean @default(true)
  
  criadoPor           String?
  createdAt           DateTime @default(now())
  updatedAt           DateTime @updatedAt
  
  @@map("sindicatos")
  @@index([regiao])
}
```

**Arquivo:** `apps/backend/prisma/schema.prisma`  
**Tempo:** 30 min

---

#### 2.2 DTOs Sindicato
**Arquivo:** `apps/backend/src/modules/sindicato/dto/sindicato.dto.ts`

```typescript
export class CreateSindicatoDto {
  @IsString() @IsNotEmpty() nome!: string;
  @IsString() @IsOptional() sigla?: string;
  @IsString() @IsNotEmpty() regiao!: string;
  @IsNumber() @IsOptional() percentualDissidio?: number;
  @IsDateString() @IsOptional() dataDissidio?: string;
  @IsString() @IsOptional() regimeTributario?: string;
  @IsString() @IsOptional() contacto?: string;
}

export class UpdateSindicatoDto {
  @IsNumber() @IsOptional() percentualDissidio?: number;
  @IsDateString() @IsOptional() dataDissidio?: string;
  @IsString() @IsOptional() regimeTributario?: string;
  @IsString() @IsOptional() contacto?: string;
}
```

**Tempo:** 30 min

---

#### 2.3 Service - SindicatoService (Expandido)
**Tarefa:** Expandir SindicatoService com novos métodos

**Novos Métodos:**
- `listarPorRegiao()` - Todos sindicatos da região
- `aplicarDissidio()` - Calcular novo custo com dissídio
- `buscarRegimeTributario()` - Regime do sindicato
- `validarImpactoSindical()` - Impacto de mudanças

**Arquivo:** `apps/backend/src/modules/sindicato/sindicato.service.ts`  
**Tempo:** 1.5 horas

---

#### 2.4 Controller Expandido
**Endpoints adicionais:**
```
GET    /sindicatos                 # Listar todos
POST   /sindicatos                 # Criar
GET    /sindicatos/:id             # Buscar
PUT    /sindicatos/:id             # Atualizar
DELETE /sindicatos/:id             # Soft delete
GET    /sindicatos/regiao/:regiao  # Por região
GET    /sindicatos/:id/dissidio    # Cálculo de dissídio
```

**Tempo:** 1 hora

---

#### 2.5 Testes Sindicato
**Cobertura:**
- ✅ Criar sindicato
- ✅ Atualizar dissídio
- ✅ Listar por região
- ✅ Calcular impacto de dissídio
- ✅ Buscar regime tributário
- ✅ Validação de erros

**Tempo:** 1.5 horas

---

### 3. Motor Integrado: Calendário + Jornada + Custo (3 dias)

#### 3.1 Serviço de Integração
**Tarefa:** Criar `CalendarioJornadaEngineService`

**Função:** Recalcular automaticamente:
```
1. Data inicial + dias de jornada
2. Descontar feriados do calendário (por estado/município)
3. Calcular horas reais trabalhadas
4. Aplicar dissídio do sindicato (se aplicável)
5. Recalcular custo (TAXA × HORAS)
6. Recalcular FTE
7. Registrar auditoria
```

**Métodos:**
```typescript
async calcularJornadaComCalendario(
  colaboradorId: string,
  mes: number,
  ano: number,
  estadoUf: string
): Promise<JornadaComImpactoDto>

async recalcularCustoComDissidio(
  jornadaId: string,
  sindicatoId: string
): Promise<CustoComDissidioDto>

async aplicarRecalculoCascata(
  colaboradorId: string,
  mes: number,
  ano: number
): Promise<RecalculoResultDto>
```

**Arquivo:** `apps/backend/src/modules/calendario/calendario-jornada.engine.ts`  
**Tempo:** 2 horas

---

#### 3.2 Testes da Engine
**Cobertura:**
- ✅ Calcular jornada sem feriados em SP
- ✅ Calcular jornada com feriados estaduais
- ✅ Aplicar dissídio sindical
- ✅ Recalcular custo com novas horas
- ✅ Validar cascata de impactos
- ✅ Casos extremos (mês com muitos feriados)

**Tempo:** 2 horas

---

### 4. Seed de Dados (1 dia)

#### 4.1 Feriados 2026-2027
**Tarefa:** Seed de feriados nacionais, estaduais

```typescript
// Exemplos:
[
  { tipo: 'FERIADO', data: '2026-01-01', nome: 'Confraternização Universal', estado: null },
  { tipo: 'FERIADO', data: '2026-02-16', nome: 'Carnaval', estado: null },
  { tipo: 'FERIADO', data: '2026-03-29', nome: 'Sexta-feira Santa', estado: null },
  { tipo: 'PONT', data: '2026-03-30', nome: 'Pont Carnaval', estado: null },
  { tipo: 'FERIADO', data: '2026-04-21', nome: 'Tiradentes', estado: null },
  // Estaduais SP
  { tipo: 'FERIADO', data: '2026-07-09', nome: 'Revolução Constitucionalista', estado: 'SP' },
  // ...mais 30+ feriados
]
```

**Arquivo:** `apps/backend/prisma/seed.ts` (adicionar)  
**Tempo:** 1.5 horas

---

#### 4.2 Sindicatos Exemplo
```typescript
[
  {
    nome: 'Sindicato dos Engenheiros SP',
    sigla: 'SEESP',
    regiao: 'SP',
    percentualDissidio: 0.045
  },
  {
    nome: 'Sindicato dos Trabalhadores em TI',
    sigla: 'STIT',
    regiao: 'Nacional',
    percentualDissidio: 0.03
  },
  // ... mais sindicatos
]
```

**Tempo:** 30 min

---

### 5. Endpoints & Integração (1 dia)

#### 5.1 Novos Endpoints
```
POST   /colaboradores/:id/recalcular-jornada     # Recalcular com calendário
GET    /dashboard/impacto-calendarios             # Dashboard de impactos
POST   /calendario/import/feriados/bulk           # Bulk import feriados
POST   /sindicatos/:id/aplicar-dissidio           # Aplicar novo dissídio
```

**Tempo:** 1.5 horas

---

### 6. Testes & Validação (1.5 dias)

#### 6.1 Testes de Integração
- ✅ Criar colaborador + calendário + recalcular
- ✅ Importar feriados + ver impacto em horas
- ✅ Mudar sindicato + recalcular custos
- ✅ Casos extremos

**Tempo:** 1.5 horas

---

#### 6.2 Validação Manual
- Testar endpoints com cURL
- Validar audit logs
- Testar performance com muitos feriados
- Testar RBAC

**Tempo:** 1 hora

---

## 📊 Estimativa de Testes

| Tipo | Quantidade | Status |
|------|-----------|--------|
| Unitários Calendario | 12 | 🔲 TODO |
| Unitários Sindicato | 10 | 🔲 TODO |
| Integração Engine | 8 | 🔲 TODO |
| Total | 30 | 🔲 TODO |

**Meta:** 240 testes no final da sprint (210 atuais + 30 novos)

---

## 📈 Critério de Sucesso

- ✅ CRUD Calendario 100% funcional
- ✅ CRUD Sindicato expandido
- ✅ Motor integrado Calendario+Jornada+Custo
- ✅ 30+ testes passando
- ✅ Seed de feriados 2026-2027 pronto
- ✅ Endpoints REST testados
- ✅ Documentação completa

---

## 🚀 Dependências

- ✅ Sprint 5 (Financeiro) - COMPLETA
- ✅ HR Module (Jornadas) - COMPLETA
- 🔲 Recálculo Cascata (Sprint 8) - Depois

---

## 📅 Timeline Sprint 6

| Dia | Atividade | Deadline |
|-----|-----------|----------|
| 1-2 | CRUD Calendario + DTOs | 05-06 Mar |
| 3-4 | Seed Feriados + Testes | 07-08 Mar |
| 5-6 | CRUD Sindicato | 09-10 Mar |
| 7   | Motor Integrado | 14 Mar |
| 8-9 | Testes Integração | 17-18 Mar |
| 10  | Validação Final | 20 Mar |

**Go-Live Sprint 6:** 24/03/2026

---

## 📝 Arquivo Checklist

```
[ ] Schema Prisma (Calendario expandido)
[ ] DTOs Calendario
[ ] DTOs Sindicato
[ ] CalendarioService (8 métodos)
[ ] SindicatoService (expandido com 4 métodos)
[ ] CalendarioJornadaEngineService
[ ] CalendarioController (10 endpoints)
[ ] Testes Calendario (12)
[ ] Testes Sindicato (10)
[ ] Testes Engine (8)
[ ] Seed Feriados 2026-2027
[ ] Seed Sindicatos
[ ] npx prisma migrate dev
[ ] npx prisma db seed
[ ] npm test (240+ testes)
[ ] Documentação endpoints
[ ] Exemplos cURL
```

---

**Sprint 6 Planejamento Concluído**  
**Próximo:** Iniciar desenvolvimento dia 04/03/2026

