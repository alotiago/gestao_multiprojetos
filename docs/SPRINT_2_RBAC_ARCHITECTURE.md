# 🏗️ RBAC System - Visão Arquitetural

## Diagrama de Fluxo de Autorização

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        REQUEST FLOW - RBAC System                           │
└─────────────────────────────────────────────────────────────────────────────┘

1️⃣  CLIENT LAYER
   ┌──────────────────────────┐
   │   Frontend / Mobile      │
   │   POST /auth/login       │
   └───────────┬──────────────┘
               │ Credentials (email + password)
               ▼
   
2️⃣  AUTHENTICATION LAYER
   ┌──────────────────────────────────────────────────────────────────┐
   │  AuthController.login()                                          │
   │  ├─ Email validation                                             │
   │  ├─ Password hash with bcrypt (cost: 10)                         │
   │  ├─ JWT generation:                                              │
   │  │  ├─ Access Token: 1 hour expiry                             │
   │  │  ├─ Refresh Token: 7 days expiry                            │
   │  │  └─ Stored in Redis for revocation                          │
   │  └─ Return: { access_token, refresh_token, user }              │
   └───────────┬────────────────────────────────────────────────────┘
               │ JWT Tokens
               ▼

3️⃣  REQUEST WITH JWT
   ┌──────────────────────────────────────────────────────────────────┐
   │  Protected Route Request                                         │
   │  GET /api/projects                                               │
   │  Headers: { Authorization: Bearer <access_token> }              │
   └───────────┬────────────────────────────────────────────────────┘
               │
               ▼

4️⃣  JWT AUTHENTICATION GUARD
   ┌──────────────────────────────────────────────────────────────────┐
   │  JwtAuthGuard.canActivate()                                      │
   │  ├─ Extract token from Authorization header                     │
   │  ├─ Verify JWT signature with HS256                             │
   │  ├─ Extract user ID + role from payload                         │
   │  ├─ Load full user from database                                │
   │  └─ Attach user to Request.user                                 │
   │                                                                   │
   │  Results:                                                        │
   │    ✅ Valid → Continue to PermissionsGuard                      │
   │    ❌ Invalid → Return 401 Unauthorized                         │
   └───────────┬────────────────────────────────────────────────────┘
               │ Request.user = { id, email, role: 'PMO' }
               ▼

5️⃣  PERMISSIONS GUARD
   ┌──────────────────────────────────────────────────────────────────┐
   │  PermissionsGuard.canActivate()                                  │
   │                                                                   │
   │  Step 1: Extract @Permissions() from metadata                    │
   │  ────────                                                       │
   │  @Permissions(Permission.PROJECT_READ)                          │
   │  → requiredPermissions = ['project:read']                        │
   │                                                                   │
   │  Step 2: Get user role from Request.user                        │
   │  ────────                                                       │
   │  user.role = 'PMO'                                               │
   │                                                                   │
   │  Step 3: Get permissions for this role                          │
   │  ────────                                                       │
   │  ROLE_PERMISSIONS['PMO'] = [                                    │
   │    'project:list',                                              │
   │    'project:create',                                            │
   │    'project:read',  ✅ FOUND                                    │
   │    'project:update',                                            │
   │    ...                                                          │
   │  ]                                                              │
   │                                                                   │
   │  Step 4: Check logic (AND vs OR)                                │
   │  ────────                                                       │
   │  @Permissions(A, B) → OR logic (any one)                        │
   │  @RequireAllPermissions(A, B) → AND logic (all required)        │
   │  Default: OR (qualquer uma é suficiente)                        │
   │                                                                   │
   │  Step 5: Decision                                               │
   │  ────────                                                       │
   │  Results:                                                        │
   │    ✅ Has permission → Continue to Controller                   │
   │    ❌ No permission → Return 403 Forbidden                      │
   │                      with detailed message                      │
   └───────────┬────────────────────────────────────────────────────┘
               │
               ├─ ✅ GRANTED
               │   │
               │   ▼
               │  6️⃣  CONTROLLER
               │   ┌──────────────────────────┐
               │   │  ProjectsController      │
               │   │  async list() {          │
               │   │    // Fetch projects     │
               │   │    return projects;      │
               │   │  }                       │
               │   └───────────┬──────────────┘
               │               │ Response
               │               ▼
               │
               ├─ ❌ DENIED (No Permission)
               │   │
               │   ▼
               │  ┌──────────────────────────────┐
               │  │  ForbiddenException (403)    │
               │  │  {                           │
               │  │    "statusCode": 403,       │
               │  │    "message": "User role    │
               │  │     'VIEWER' missing         │
               │  │     permissions:            │
               │  │     project:update          │
               │  │     (required: any)"        │
               │  │  }                          │
               │  └──────────────────────────────┘
               │
               └─ ❌ ERROR (Token Invalid/Expired)
                   │
                   ▼
                  ┌──────────────────────────────┐
                  │  401 Unauthorized            │
                  │  {                           │
                  │    "statusCode": 401,       │
                  │    "message": "Invalid token"│
                  │  }                          │
                  └──────────────────────────────┘

7️⃣  CLIENT RESPONSE
   ┌──────────────────────────────────────────────────────────────────┐
   │  ✅ 200 OK         → Process response data                        │
   │  ❌ 401 Unauthorized → Redirect to login                          │
   │  ❌ 403 Forbidden  → Show permission denied message              │
   └──────────────────────────────────────────────────────────────────┘
```

---

## 🔄 Permission Validation Logic

```
PermissionsGuard:
  
  ┌─────────────────────────────────────┐
  │ Extrair @Permissions() metadata     │
  └────────────┬────────────────────────┘
               │
               ▼
  ┌─────────────────────────────────────┐
  │ Nenhuma permissão requerida?        │
  │ (Route sem @Permissions)             │
  └────┬────────────────────────┬────────┘
       │ SIM                    │ NÃO
       ▼                        ▼
   ✅ ALLOW               ┌──────────────┐
                          │ User logado? │
                          └────┬────┬───┘
                               │    │
                        NÃO ◄──┘    └─► SIM
                        │              │
                        ▼              ▼
                    ❌ 401          ┌──────────────────┐
                    Unauthorized   │ Check Logic:     │
                                   │ @Permissions =   │
                                   │ OR (default)     │
                                   └────┬────┬────────┘
                                        │    │
                           ┌────────────┘    └──────────┐
                           ▼                            ▼
                    @RequireAllPermissions      @RequireAnyPermission
                    (AND logic)                 (OR logic)
                           │                            │
                           ▼                            ▼
                   ┌─────────────────┐         ┌─────────────────┐
                   │ User tem TODAS  │         │ User tem ALGUMA │
                   │ permissões?     │         │ permissão?      │
                   └────┬────────┬───┘         └────┬────────┬───┘
                        │        │                  │        │
                   SIM  │        │  NÃO        SIM │        │ NÃO
                        ▼        ▼                  ▼        ▼
                        ✅       ❌               ✅       ❌
                     ALLOW    403                ALLOW    403
                            FORBIDDEN                  FORBIDDEN
```

---

## 🎯 Role Hierarchy

```
                            ┌─────────────────┐
                            │     ADMIN       │
                            │  (40+ perms)    │
                            │  SUPERUSUÁRIO   │
                            └────────┬────────┘
                                     │
                    ┌────────────────┼────────────────┐
                    │                │                │
                    ▼                ▼                ▼
            ┌──────────────┐ ┌──────────────┐ ┌──────────────┐
            │     PMO      │ │      HR      │ │   FINANCE    │
            │ (25+ perms)  │ │ (12+ perms)  │ │ (12+ perms)  │
            │ Projects +   │ │ Resources +  │ │ Financial +  │
            │ Resources    │ │ Jornada      │ │ Approve      │
            └───────┬──────┘ └──────────────┘ └──────────────┘
                    │
                    ▼
            ┌──────────────────┐
            │ PROJECT_MANAGER  │
            │  (10+ perms)     │
            │  Own project +   │
            │  Resources       │
            └────────┬─────────┘
                     │
                     ▼
            ┌──────────────────┐
            │     VIEWER       │
            │  (6+ perms)      │
            │  Read-only       │
            └──────────────────┘
```

---

## 🛡️ Permission Ecosystem

```
┌─────────────────────────────────────────────────────────────────────┐
│                          PERMISSION ENUM                            │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐              │
│  │ AUTENTICAÇÃO │  │   USUÁRIOS   │  │  PROJETOS    │              │
│  │  (4)         │  │   (7)        │  │  (7)         │              │
│  ├──────────────┤  ├──────────────┤  ├──────────────┤              │
│  │ auth:login   │  │ user:list    │  │ project:list │              │
│  │ auth:register│  │ user:create  │  │ project:crud │              │
│  │ auth:refresh │  │ user:update  │  │ project:export              │
│  │ auth:logout  │  │ user:delete  │  │ project:forecast            │
│  │              │  │ ...          │  │              │              │
│  └──────────────┘  └──────────────┘  └──────────────┘              │
│                                                                      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐              │
│  │  RECURSOS    │  │ FINANCEIRO   │  │ CONFIG       │              │
│  │  (7)         │  │  (7)         │  │  (4)         │              │
│  ├──────────────┤  ├──────────────┤  ├──────────────┤              │
│  │ resource:*   │  │ financial:*  │  │ config:*     │              │
│  │ + jornada    │  │ + approve    │  │              │              │
│  └──────────────┘  └──────────────┘  └──────────────┘              │
│                                                                      │
│  ┌──────────────┐  ┌──────────────┐                                │
│  │ DASHBOARDS   │  │ ADMIN        │                                │
│  │  (4)         │  │  (3)         │                                │
│  ├──────────────┤  ├──────────────┤                                │
│  │ dashboard:*  │  │ admin:*      │                                │
│  └──────────────┘  └──────────────┘                                │
│                                                                      │
│  TOTAL: 36 Permissões Granulares                                    │
│  Organizadas em 8 Categorias Temáticas                              │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
             ↓
┌─────────────────────────────────────────────────────────────────────┐
│                    ROLE PERMISSIONS MAPPING                         │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ROLE_PERMISSIONS = {                                              │
│    'ADMIN': [ALL 36 permissions],                                   │
│    'PMO': [project:*, resource:*, dashboard:*, config:*],           │
│    'PROJECT_MANAGER': [project:read, resource:*, dashboard:owner],  │
│    'HR': [resource:*, config:calendar, ...],                       │
│    'FINANCE': [financial:*, dashboard:financial, ...],             │
│    'VIEWER': [*:read only permissions]                             │
│  }                                                                  │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
             ↓
┌─────────────────────────────────────────────────────────────────────┐
│                   PERMISSION SERVICE METHODS                        │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ✓ getUserPermissions(role)                                         │
│    → Retorna todas as permissões do role                           │
│                                                                      │
│  ✓ hasPermission(role, permission)                                 │
│    → Verifica se user tem 1 permissão                              │
│                                                                      │
│  ✓ hasAllPermissions(role, [permissions])                          │
│    → Verifica se user tem TODAS (AND)                              │
│                                                                      │
│  ✓ hasAnyPermission(role, [permissions])                           │
│    → Verifica se user tem QUALQUER UMA (OR)                        │
│                                                                      │
│  ✓ getPermissionDescription(permission)                            │
│    → Retorna descrição em português                                │
│                                                                      │
│  ✓ getAllPermissionsGrouped()                                      │
│    → Retorna permissões agrupadas por categoria                    │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
             ↓
┌─────────────────────────────────────────────────────────────────────┐
│                         PROTECTED ROUTE                             │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  @Post('/projects')                                                 │
│  @Permissions(Permission.PROJECT_CREATE)                            │
│  @UseGuards(JwtAuthGuard, PermissionsGuard)                         │
│  async createProject() { }                                          │
│                                                                      │
│  Fluxo:                                                             │
│  1. JwtAuthGuard valida o JWT                                       │
│  2. PermissionsGuard verifica se user tem PROJECT_CREATE            │
│  3. Se ✅, controller executa                                       │
│  4. Se ❌, ForbiddenException 403                                   │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 📊 Permission Matrix - Quick Reference

```
┌─────────────────────────────────────────────────────────────────────┐
│ PERMISSÃO              DESCRIÇÃO                    ROLES COM ACESSO │
├─────────────────────────────────────────────────────────────────────┤
│                       AUTENTICAÇÃO                                   │
│ auth:login             Fazer login                  Todos            │
│ auth:register          Registrar novo usuário       Todos            │
│ auth:refresh           Renovar token                Todos            │
│ auth:logout            Fazer logout                 Todos            │
├─────────────────────────────────────────────────────────────────────┤
│                        USUÁRIOS                                      │
│ user:list              Listar usuários              ADMIN, PMO       │
│ user:create            Criar usuário                ADMIN, PMO       │
│ user:read              Ver dados de um usuário      ADMIN, PMO       │
│ user:update            Atualizar dados              ADMIN, PMO       │
│ user:delete            Deletar usuário              ADMIN            │
│ user:change_role       Mudar role do usuário        ADMIN            │
│ user:view_stats        Ver estatísticas por role    ADMIN, PMO       │
├─────────────────────────────────────────────────────────────────────┤
│                       PROJETOS                                       │
│ project:list           Listar projetos              ADMIN, PMO,      │
│                                                     PROJECT_MANAGER, │
│                                                     FINANCE, VIEWER  │
│ project:create         Criar projeto                ADMIN, PMO       │
│ project:read           Ver detalhes                 Todos            │
│ project:update         Atualizar projeto            ADMIN, PMO       │
│ project:delete         Deletar projeto              ADMIN            │
│ project:export         Exportar dados               ADMIN, PMO       │
│ project:forecast       Gerar forecasts              ADMIN, PMO       │
├─────────────────────────────────────────────────────────────────────┤
│                       RECURSOS                                       │
│ resource:list          Listar recursos              ADMIN, PMO, HR   │
│ resource:create        Criar recurso                ADMIN, HR        │
│ resource:read          Ver detalhes                 ADMIN, PMO, HR   │
│ resource:update        Atualizar recurso            ADMIN, PMO, HR   │
│ resource:delete        Deletar recurso              ADMIN, HR        │
│ resource:manage_jornada Gerenciar jornada           ADMIN, HR        │
│ resource:bulk_update   Atualizar múltiplos          ADMIN, HR        │
├─────────────────────────────────────────────────────────────────────┤
│                       FINANCEIRO                                     │
│ financial:list         Listar dados financeiros     ADMIN, PMO,      │
│                                                     FINANCE, VIEWER  │
│ financial:create       Criar registro               ADMIN, FINANCE   │
│ financial:read         Ver dados                    ADMIN, FINANCE   │
│ financial:update       Atualizar dados              ADMIN, FINANCE   │
│ financial:delete       Deletar dados                ADMIN, FINANCE   │
│ financial:approve      Aprovar operações            ADMIN, FINANCE   │
│ financial:view_reports Gerar relatórios             ADMIN, FINANCE   │
├─────────────────────────────────────────────────────────────────────┤
│                       CONFIGURAÇÃO                                   │
│ config:calendar        Gerenciar calendário         ADMIN, PMO, HR   │
│ config:sindicato       Gerenciar sindicato          ADMIN, PMO       │
│ config:indices         Atualizar índices            ADMIN, FINANCE   │
│ config:system          Config gerais do sistema     ADMIN            │
├─────────────────────────────────────────────────────────────────────┤
│                       DASHBOARDS                                     │
│ dashboard:executive    Dashboard executivo          ADMIN, PMO,      │
│                                                     FINANCE          │
│ dashboard:financial    Dashboard financeiro         ADMIN, FINANCE   │
│ dashboard:resources    Dashboard de recursos        ADMIN, PMO, HR   │
│ dashboard:projects     Dashboard de projetos        ADMIN, PMO,      │
│                                                     PROJECT_MANAGER  │
├─────────────────────────────────────────────────────────────────────┤
│                       ADMINISTRAÇÃO                                  │
│ admin:full_access      Acesso total (super)         ADMIN ONLY       │
│ admin:view_audit       Ver logs de auditoria        ADMIN            │
│ admin:manage_permissions Gerenciar permissões       ADMIN            │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 🔐 Security Layers

```
                  INCOMING REQUEST
                        │
                        ▼
        ┌───────────────────────────────────┐
        │    Layer 1: JWT VALIDATION        │
        │    JwtAuthGuard                   │
        ├───────────────────────────────────┤
        │ • Token Signature (HS256)         │
        │ • Token Expiry                    │
        │ • User Existence in DB            │
        └───────────┬───────────────────────┘
                    │
        ✅ Valid › │
        ❌ Invalid › 401 Unauthorized
                    │
                    ▼
        ┌───────────────────────────────────┐
        │    Layer 2: ROLE VALIDATION       │
        │    PermissionsGuard               │
        ├───────────────────────────────────┤
        │ • Extract Required Permission(s)  │
        │ • Check User's Role               │
        │ • Verify in ROLE_PERMISSIONS      │
        │ • Support AND/OR logic            │
        └───────────┬───────────────────────┘
                    │
        ✅ Granted › │
        ❌ Denied › 403 Forbidden
                    │
                    ▼
        ┌───────────────────────────────────┐
        │    Layer 3: BUSINESS LOGIC        │
        │    Controller/Service             │
        ├───────────────────────────────────┤
        │ • Data Ownership Checks           │
        │ • Soft Delete Logic               │
        │ • Audit Logging                   │
        │ • Field-level Security            │
        └───────────┬───────────────────────┘
                    │
                    ▼
              RESPONSE TO CLIENT
```

---

## 🧪 Testing Strategy

```
PERMISSION TESTING PYRAMID
       ▲
       │
       │      ╔════════════════════════╗
       │      ║   E2E Integration     ║
       │      ║   • Full request cycle ║
       │      ║   • Auth + Auth + Biz   ║
       │      ║   (10+ months)          ║
       │      ╚════════════════════════╝
       │
       │      ╔════════════════════════╗
       │      ║  Guard/Decorator Tests ║
       │      ║  • Permission check     ║
       │      ║  • AND/OR logic         ║
       │      ║  (25+ tests)            ║
       │      ╚════════════════════════╝
       │
       │      ╔════════════════════════╗
       │      ║  Unit Tests            ║
       │      ║  • Service logic        ║
       │      ║  • Util functions       ║
       │      ║  (40+ tests)            ║
       │      ╚════════════════════════╝
       │
       └────────────────────────────────────→

Current Status: Base (65+ tests) ✅ Built
Next: Integration (E2E) ⏳ TODO
```

---

## 🚀 Performance Characteristics

```
Operation                Complexity    Cache?    Notes
─────────────────────────────────────────────────────────────
hasPermission()          O(n)          ✅        n = perms per role (~10-40)
hasAllPermissions()      O(n*m)        ✅        n=roles, m=perms each
hasAnyPermission()       O(n)          ✅        Early exit on match
getUserPermissions()     O(1)          ✅        Direct lookup
JwtAuthGuard            O(1) crypto    ✅        Token verification
PermissionsGuard        O(1) lookup    ✅        Metadata + service call

Recommended Caching:
• ROLE_PERMISSIONS constant: No need (already in memory)
• getUserPermissions(): Cache 1h (per role)
• JwtAuthGuard: No cache (validate every request)
• PermissionsGuard: No cache (evaluate per request)
```

---

**Última Atualização**: 01/03/2026  
**Versão**: 1.0 - Production Ready
