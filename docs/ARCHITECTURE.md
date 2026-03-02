# Documento de Arquitetura – Gestor Multiprojetos

**Versão:** 1.0  
**Data:** 01/03/2026  
**Autor:** Time Técnico  
**Status:** Aprovado

---

## 1. Visão Geral Arquitetural

### 1.1 Padrão Arquitetural

A plataforma Gestor Multiprojetos segue uma arquitetura **Microserviços Monolítica** organizada em **Monorepo**, com separação clara entre frontend e backend:

```
┌─────────────────────────────────────────────────────┐
│             CLIENTE (Browser)                       │
│          Next.js SPA + React 18                    │
└──────────────────┬──────────────────────────────────┘
                   │ HTTPS/REST
                   ▼
┌─────────────────────────────────────────────────────┐
│          API GATEWAY / BFF                          │
│    (Autenticação, Rate Limiting, Roteamento)       │
└──────────────────┬──────────────────────────────────┘
                   │ REST/GraphQL
                   ▼
┌─────────────────────────────────────────────────────┐
│         BACKEND SERVICES (NestJS)                   │
│  ┌─────────────┐  ┌─────────────┐                  │
│  │ Auth Service│  │ Projects    │                  │
│  │             │  │ Service     │                  │
│  └─────────────┘  └─────────────┘                  │
│  ┌─────────────┐  ┌─────────────┐                  │
│  │ HR Service  │  │ Finance     │                  │
│  │             │  │ Service     │                  │
│  └─────────────┘  └─────────────┘                  │
└────────────────┬─────────────────────────────────┬─┘
                 │                                 │
                 ▼                                 ▼
        ┌──────────────────┐         ┌────────────────┐
        │  PostgreSQL 16   │         │  Redis 7       │
        │  (Dados)         │         │  (Cache/Session)
        └──────────────────┘         └────────────────┘
```

### 1.2 Componentes Principais

| Componente | Tecnologia | Responsabilidade |
|-----------|-----------|------------------|
| **Frontend** | Next.js 14 + React 18 | Interface de usuário, gestão de estado, responsividades |
| **Backend** | NestJS + TypeScript | Lógica de negócio, validações, acesso a dados |
| **BD Principal** | PostgreSQL 16 | Armazenamento de dados persistentes |
| **Cache** | Redis 7 | Cache de sessões, dados frequentes, filas |
| **Autenticação** | JWT | Tokens seguros, refresh tokens |
| **Monitoramento** | Prometheus + Grafana | Métricas, logs, alertas |
| **CI/CD** | GitHub Actions | Build automático, testes, deploy |

---

## 2. Stack Tecnológico Detalhado

### 2.1 Frontend

```json
{
  "framework": "Next.js 14.x (React 18)",
  "linguagem": "TypeScript",
  "styling": "Tailwind CSS + Ant Design",
  "estado": "Zustand + React Query",
  "gráficos": "Recharts / ECharts",
  "formulários": "React Hook Form + Zod",
  "testes": "Jest + Cypress",
  "bundler": "Next.js (Webpack)"
}
```

**Dependências Principais:**
- `next`: Framework React SSR/SSG
- `react`, `react-dom`: Biblioteca UI
- `typescript`: Type safety
- `tailwindcss`: Utility-first CSS
- `antd`: Componentes de UI enterprise
- `zustand`: State management
- `react-query` (TanStack Query): Data fetching + caching
- `axios`: HTTP client
- `zod`: Validação de schema
- `recharts`: Gráficos
- `cypress`: Testes E2E

### 2.2 Backend

```json
{
  "framework": "NestJS (Express)",
  "linguagem": "TypeScript",
  "database": "PostgreSQL + Prisma",
  "autenticação": "JWT",
  "validação": "class-validator + class-transformer",
  "logging": "Winston",
  "documentação": "Swagger/OpenAPI 3.0",
  "testes": "Jest",
  "cache": "Redis"
}
```

**Dependências Principais:**
- `@nestjs/core`: Core framework
- `@nestjs/common`: Decorators e utilitários
- `@nestjs/typeorm` ou Prisma: ORM
- `@nestjs/jwt`: JWT strategy
- `@nestjs/passport`: Autenticação
- `@nestjs/swagger`: Documentação automática
- `prisma`: Query builder tipo-seguro
- `class-validator`: Validação de DTOs
- `redis`: Cliente Redis
- `winston`: Logging estruturado
- `jest`: Framework de testes

### 2.3 Infraestrutura

```json
{
  "containerização": "Docker + Docker Compose",
  "orquestração_prod": "Kubernetes (futuro)",
  "banco_dados": "PostgreSQL 16 Alpine",
  "cache": "Redis 7 Alpine",
  "monitoramento": "Prometheus + Grafana",
  "logging": "ELK Stack (futuro)",
  "ci_cd": "GitHub Actions"
}
```

---

## 3. Modelo de Dados (ERD Conceitual)

### 3.1 Entidades Principais

```
┌─────────────────┐
│   Usuario       │
├─────────────────┤
│ id (PK)         │
│ email (unique)  │
│ senha (hash)    │
│ nome            │
│ perfil (FK)     │
│ ativo           │
│ created_at      │
└─────────────────┘
        │
        │ 1:N
        ▼
┌─────────────────┐
│   Perfil        │
├─────────────────┤
│ id (PK)         │
│ nome            │
│ permissoes (JSON)
└─────────────────┘

┌─────────────────┐
│   Projeto       │
├─────────────────┤
│ id (PK)         │
│ codigo          │
│ cliente         │
│ status          │
│ data_inicio     │
│ data_fim        │
│ criado_por (FK) │
│ created_at      │
└─────────────────┘
        │
        │ 1:N
        ▼
┌──────────────────┐
│ ReceitaMensal    │
├──────────────────┤
│ id (PK)          │
│ projeto_id (FK)  │
│ mes              │
│ ano              │
│ valor_previsto   │
│ valor_realizado  │
└──────────────────┘

┌──────────────────┐
│ Colaborador      │
├──────────────────┤
│ id (PK)          │
│ matricula        │
│ nome             │
│ cargo            │
│ taxa_hora        │
│ carga_horaria    │
│ status           │
│ sindicato_id (FK)│
└──────────────────┘

┌──────────────────┐
│ CustoMensal      │
├──────────────────┤
│ id (PK)          │
│ colaborador_id(FK)
│ projeto_id (FK)  │
│ mes              │
│ ano              │
│ custo_fixo       │
│ custo_variavel   │
│ impostos         │
└──────────────────┘
```

### 3.2 Relações

- **Usuario** : Perfil = `N : 1`
- **Projeto** : ReceitaMensal = `1 : N`
- **Projeto** : CustoMensal = `1 : N`
- **Colaborador** : Sindicato = `N : 1`
- **Colaborador** : CustoMensal = `1 : N`

---

## 4. Fluxos de Dados Principais

### 4.1 Fluxo de Autenticação

```
1. Usuário entra com (email, senha)
2. Backend valida credenciais em PostgreSQL
3. Se válido: gera JWT + Refresh Token (redis)
4. Frontend armazena JWT em localStorage
5. JWT incluído em header de todos os requests
6. Backend valida JWT + extrai claims
7. Se expired: usa refresh token para obter novo JWT
```

### 4.2 Fluxo de Cálculo de FCST

```
1. Frontend solicita FCST para projeto (POST /api/projects/:id/fcst)
2. Backend carrega dados históricos:
   - Receitas mensais dos 12 últimos meses
   - Taxa de crescimento
3. Backend aplica modelo FCST:
   - Média móvel / Linear regression / Exponential smoothing
4. Backend gera previsões para 2026-2030
5. Resultado cacheado em Redis por 24h
6. Frontend renderiza gráfico interativo com Recharts
```

### 4.3 Fluxo de Cálculo de Custos (RH + Financeiro)

```
1. Editor altera horas/taxa de colaborador
2. Sistema recalcula em cascata:
   a) Horas mensais (baseado calendário regional)
   b) FTE = (horas_trabalhadas / horas_previstas)
   c) Custo bruto = (horas * taxa_hora)
   d) Impostos = (custo_bruto * alíquota)
   e) Custo total = (custo_bruto + impostos)
3. Resultado armazenado em CustoMensal
4. Dashboard atualizado em tempo real (WebSocket/polling)
5. Histórico mantido para auditoria
```

---

## 5. Padrões de Projeto e Boas Práticas

### 5.1 Backend (NestJS)

#### Estrutura de Pastas

```
apps/backend/
├── src/
│   ├── common/               # Utilitários compartilhados
│   │   ├── decorators/       # Decoradores customizados
│   │   ├── filters/          # Exception filters
│   │   ├── guards/           # Guards (autenticação)
│   │   ├── interceptors/     # Interceptors
│   │   └── pipes/            # Validation pipes
│   │
│   ├── config/               # Configuração (ambiente, DB)
│   │
│   ├── modules/              # Módulos de negócio
│   │   ├── auth/
│   │   │   ├── auth.module.ts
│   │   │   ├── auth.service.ts
│   │   │   ├── auth.controller.ts
│   │   │   ├── strategies/
│   │   │   └── dtos/
│   │   │
│   │   ├── projects/
│   │   ├── users/
│   │   ├── hr/
│   │   ├── finance/
│   │   ├── calendar/
│   │   └── syndicate/
│   │
│   ├── database/             # Migrations, seeders
│   │   ├── migrations/
│   │   ├── seeds/
│   │   └── prisma/
│   │
│   ├── app.module.ts        # Root module
│   └── main.ts              # Entry point
│
├── test/
│   ├── auth.spec.ts
│   ├── projects.e2e.spec.ts
│   └── ...
│
├── prisma/
│   ├── schema.prisma        # Schema do banco
│   └── .env.local
│
├── package.json
├── tsconfig.json
└── Dockerfile
```

#### Padrões de Código

**1. Modular Architecture**
```typescript
// Exemplo: ProjectsModule
@Module({
  imports: [TypeOrmModule.forFeature([Project])],
  controllers: [ProjectsController],
  providers: [ProjectsService],
})
export class ProjectsModule {}
```

**2. Dependency Injection**
```typescript
@Injectable()
export class ProjectsService {
  constructor(private readonly projectRepo: ProjectRepository) {}
}
```

**3. DTOs + Validation**
```typescript
export class CreateProjectDto {
  @IsString()
  @MinLength(3)
  codigo: string;

  @IsEmail()
  email_cliente: string;
}
```

**4. Exception Handling**
```typescript
throw new BadRequestException('Validation failed');
throw new UnauthorizedException('Invalid credentials');
throw new NotFoundException('Project not found');
```

### 5.2 Frontend (Next.js + React)

#### Estrutura de Pastas

```
apps/frontend/
├── public/
│   ├── logos/               # Assets estáticos
│   └── icons/
│
├── src/
│   ├── app/                 # App Router (Next.js 13+)
│   │   ├── (auth)/          # Rota de autenticação
│   │   │   ├── login/
│   │   │   └── layout.tsx
│   │   │
│   │   ├── dashboard/       # Rota privada
│   │   │   ├── page.tsx
│   │   │   └── layout.tsx
│   │   │
│   │   └── layout.tsx       # Root layout
│   │
│   ├── components/          # Componentes reutilizáveis
│   │   ├── common/
│   │   ├── modules/
│   │   │   ├── projects/
│   │   │   ├── hr/
│   │   │   └── finance/
│   │   └── ui/              # UI primitivos
│   │
│   ├── hooks/               # Custom React hooks
│   │   ├── useAuth.ts
│   │   ├── useProjects.ts
│   │   └── useApi.ts
│   │
│   ├── stores/              # Zustand stores
│   │   ├── authStore.ts
│   │   ├── filterStore.ts
│   │   └── uiStore.ts
│   │
│   ├── services/            # API clients
│   │   ├── api.ts
│   │   ├── auth.service.ts
│   │   ├── projects.service.ts
│   │   └── ...
│   │
│   ├── styles/              # Tailwind + global styles
│   │   └── globals.css
│   │
│   ├── utils/               # Funções utilitárias
│   │   ├── formatters.ts
│   │   ├── validators.ts
│   │   └── constants.ts
│   │
│   ├── middleware.ts        # Next.js middleware
│   └── types/               # TypeScript types
│       ├── api.ts
│       └── domain.ts
│
├── __tests__/               # Testes
│   ├── unit/
│   └── e2e/
│
├── package.json
├── tsconfig.json
├── next.config.js
└── Dockerfile
```

#### Padrões de Código

**1. Hook Customizado para API**
```typescript
export const useProjectsFetch = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchProjects = async () => {
      setLoading(true);
      try {
        const data = await projectsService.list();
        setProjects(data);
      } catch (error) {
        toast.error('Erro ao carregar projetos');
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  return { projects, loading };
};
```

**2. Zustand Store**
```typescript
interface AuthStore {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  isAuthenticated: false,
  login: async (email, password) => {
    const response = await authService.login(email, password);
    set({ user: response.user, isAuthenticated: true });
  },
  logout: () => set({ user: null, isAuthenticated: false }),
}));
```

**3. Componente com Type Safety**
```typescript
interface ProjectCardProps {
  project: Project;
  onEdit: (id: string) => void;
}

export const ProjectCard: React.FC<ProjectCardProps> = ({ project, onEdit }) => {
  return (
    <card onClick={() => onEdit(project.id)}>
      <h2>{project.codigo}</h2>
      <p>{project.cliente}</p>
    </card>
  );
};
```

---

## 6. Segurança

### 6.1 Autenticação

- **Método:** JWT (JSON Web Tokens)
- **Armazenamento:** localStorage (frontend)
- **Duração:** 24h (access token), 7d (refresh token)
- **Refresh:** Automático via Refresh Token endpoint

### 6.2 Autorização (RBAC)

```typescript
// Roles pré-definidos
enum UserRole {
  ADMIN = 'admin',
  PMO = 'pmo',
  PROJECT_MANAGER = 'project_manager',
  HR = 'hr',
  FINANCE = 'finance',
  VIEWER = 'viewer',
}

// Proteção de rotas
@UseGuards(AuthGuard, RolesGuard)
@Roles(UserRole.PMO, UserRole.ADMIN)
@Get('projects')
getProjects() { }
```

### 6.3 Proteção de Dados

| Aspecto | Medida |
|---------|--------|
| **Transmissão** | HTTPS (TLS 1.3) |
| **Armazenamento de Senha** | bcrypt (salt rounds = 10) |
| **Senhas no BD** | Nunca em plaintext |
| **Rate Limiting** | 100 req/min por IP |
| **CORS** | Whitelist de domínios |
| **SQL Injection** | Prepared statements (Prisma) |
| **XSS** | Content Security Policy (CSP) headers |
| **CSRF** | CSRF tokens em forms |
| **Logs Sensíveis** | Mascarados (email, senha, token) |

---

## 7. Performance e Escalabilidade

### 7.1 Caching Strategy

```
Nível 1: Application Memory (em-memory cache - Lru)
         ↓
Nível 2: Redis Cache (24h TTL por padrão)
         ↓
Nível 3: Database Query (Indexed columns)
         ↓
Nível 4: Lazy Load + Pagination (frontend)
```

### 7.2 Otimizações

| Técnica | Implementação |
|---------|--------------|
| **Database Indexing** | Índices em colunas de busca (projeto_id, user_id, data) |
| **Connection Pooling** | PostgreSQL connection pool (25 conexões) |
| **N+1 Query Prevention** | Eager loading with Prisma `include()` |
| **Pagination** | Limit 50 registros por page (default) |
| **Compression** | gzip compression no backend + frontend |
| **CDN** | Assets estáticos servidos via Cloudflare (futuro) |
| **Code Splitting** | Next.js dynamic imports |
| **Image Optimization** | Next.js Image component com WebP |

---

## 8. Monitoramento e Observabilidade

### 8.1 Métricas Coletadas (Prometheus)

```
# Backend
http_requests_total{method="GET",endpoint="/api/projects",status="200"}
http_request_duration_seconds{endpoint="/api/projects",quantile="0.95"}
db_query_duration_seconds{query_type="select",table="projetos"}
cache_hits_total{cache_type="redis",key="projects:*"}
```

### 8.2 Alertas

```yaml
# Exemplos de alertas
- alert: HighErrorRate
  condition: rate(http_requests_total{status="5xx"}[5m]) > 0.05
  action: Slack notification

- alert: DatabaseConnectionPoolExhausted
  condition: pg_stat_database_numbackends > 24
  action: Page on-call engineer
```

### 8.3 Logs Estruturados

```json
{
  "timestamp": "2026-03-01T10:30:45Z",
  "level": "error",
  "service": "backend",
  "endpoint": "/api/projects",
  "user_id": "user123",
  "request_id": "req-abc123",
  "error": "Internal server error",
  "error_code": "ERR_DB_CONNECTION",
  "stack_trace": "..."
}
```

---

## 9. Deployment e CI/CD

### 9.1 Ambientes

```
┌─────────────────────────────────────────┐
│    Development (Local Docker)           │
│    - Todos podem fazer deploy           │
│    - Sem backups automáticos            │
└─────────────────────────────────────────┘
           ↓ commit push
┌─────────────────────────────────────────┐
│    Staging (Pre-production)             │
│    - Testes automatizados               │
│    - Backup horário                     │
│    - Monitoramento ativo                │
└─────────────────────────────────────────┘
           ↓ após QA aprovação
┌─────────────────────────────────────────┐
│    Production                           │
│    - Blue-green deployment              │
│    - Backup diário + semanal            │
│    - SLA 99.5%                          │
│    - Rollback automático em erro        │
└─────────────────────────────────────────┘
```

### 9.2 Pipeline CI/CD

```
git commit
    ↓ GitHub Actions triggered
┌─────────────────────────────┐
│ 1. Build & Lint             │
│    - npm run lint           │
│    - npm run build          │
└─────────────────────────────┘
    ↓ Success
┌─────────────────────────────┐
│ 2. Test                     │
│    - npm run test           │
│    - npm run test:e2e       │
│    - Code coverage > 80%    │
└─────────────────────────────┘
    ↓ Success
┌─────────────────────────────┐
│ 3. Security Scan            │
│    - SAST (SonarQube)       │
│    - Dependency check       │
└─────────────────────────────┘
    ↓ Success
┌─────────────────────────────┐
│ 4. Deploy                   │
│    - Docker build + push    │
│    - Deploy to staging      │
│    - Run smoke tests        │
└─────────────────────────────┘
    ↓ Manual approval for prod
┌─────────────────────────────┐
│ 5. Promote to Production    │
│    - Blue-green deploy      │
│    - Health checks          │
│    - Rollback if issues     │
└─────────────────────────────┘
```

---

## 10. Decisões e Trade-offs

### 10.1 Por que Next.js + NestJS?

| Critério | Decisão | Razão |
|----------|---------|-------|
| **Framework Front** | Next.js | SSR/SSO, SEO, performance, isomórfico |
| **Framework Back** | NestJS | Estruturado, TypeScript, modular, escalável |
| **ORM** | Prisma | Type-safe, migrations, dev experience |
| **Banco** | PostgreSQL | ACID, JSON, extensível, escalável |
| **Cache** | Redis | Performance, sessões, filas |

### 10.2 Monorepo vs Multi-repo

**Escolha:** Monorepo com Turbo

**Vantagens:**
- Código compartilhado (types, utilitários)
- Builds otimizadas (Turbo cache)
- Revisões atômicas
- Versionamento único

**Desvantagens:**
- Repositório maior
- Requer disciplina na organização

---

## 11. Roadmap Técnico

### Q1 2026 (Sprint 1-3)
- ✅ Setup infraestrutura
- ✅ Autenticação + RBAC
- ✅ Módulo de Projetos + FCST

### Q2 2026 (Sprint 4-7)
- RH + Financeiro + Calendários
- Dashboards executivos
- Performance optimization

### Q3 2026 (Sprint 8-10)
- Testes completos
- Security hardening
- Go-live

### Q4 2026+
- GraphQL migration
- Kubernetes deployment
- ELK Stack integration
- Advanced analytics

---

## 12. Contato e Escalação

- **Tech Lead:** (a definir)
- **DevOps Lead:** (a definir)
- **Issues Críticos:** Escalação para CTO

---

**Documento versão:** 1.0  
**Última atualização:** 01/03/2026  
**Próxima revisão:** 30/04/2026 (fim Sprint 5)
