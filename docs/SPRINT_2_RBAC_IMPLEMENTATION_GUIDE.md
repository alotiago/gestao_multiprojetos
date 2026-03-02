# 🔐 Sistema RBAC - Guia Completo de Implementação

**Versão**: 1.0  
**Data**: 01/03/2026  
**Escopo**: Permission-based RBAC com suporte a múltiplas permissões e lógica AND/OR

---

## 📋 Índice

1. [Arquitetura](#arquitetura)
2. [Componentes](#componentes)
3. [Permissões Disponíveis](#permissões-disponíveis)
4. [Roles e Mapeamentos](#roles-e-mapeamentos)
5. [Como Usar](#como-usar)
6. [Exemplos Práticos](#exemplos-práticos)
7. [Troubleshooting](#troubleshooting)
8. [Best Practices](#best-practices)

---

## 🏗️ Arquitetura

```
Request com JWT
        ↓
JwtAuthGuard (valida token)
        ↓
PermissionsGuard (valida permissões)
        ↓
Controller (lógica da rota)
```

### Fluxo Detalhado

```
1. User faz POST /auth/login com credenciais
2. AuthService valida senha com bcrypt
3. JWT Access Token (1h) + Refresh Token (7d) são gerados
4. User envia Authorization: Bearer <token> em requisições
5. JwtAuthGuard extrai user do token
6. PermissionsGuard valida se user tem permissões requeridas
7. Se validado, rota é executada
8. Se não, ForbiddenException é lançada
```

---

## 🔧 Componentes

### **1. Permission Enum**

```typescript
// permissão.service.ts
export enum Permission {
  // AUTENTICAÇÃO
  AUTH_LOGIN = 'auth:login',
  AUTH_REGISTER = 'auth:register',
  AUTH_REFRESH = 'auth:refresh',
  AUTH_LOGOUT = 'auth:logout',
  
  // USUÁRIOS
  USER_LIST = 'user:list',
  USER_CREATE = 'user:create',
  USER_READ = 'user:read',
  USER_UPDATE = 'user:update',
  USER_DELETE = 'user:delete',
  USER_CHANGE_ROLE = 'user:change_role',
  USER_VIEW_STATS = 'user:view_stats',
  
  // PROJETOS
  PROJECT_LIST = 'project:list',
  PROJECT_CREATE = 'project:create',
  PROJECT_READ = 'project:read',
  PROJECT_UPDATE = 'project:update',
  PROJECT_DELETE = 'project:delete',
  PROJECT_EXPORT = 'project:export',
  PROJECT_FORECAST = 'project:forecast',
  
  // ... mais permissões
}
```

### **2. ROLE_PERMISSIONS Constant**

```typescript
export const ROLE_PERMISSIONS: Record<string, Permission[]> = {
  [UserRole.ADMIN]: [
    Permission.ADMIN_FULL_ACCESS, // superpermissão
    // + todas as outras...
  ],
  [UserRole.PMO]: [
    Permission.PROJECT_LIST,
    Permission.PROJECT_CREATE,
    Permission.PROJECT_UPDATE,
    // ...
  ],
  [UserRole.VIEWER]: [
    Permission.PROJECT_READ,
    Permission.RESOURCE_READ,
    // ... apenas read
  ],
};
```

### **3. PermissionService**

```typescript
@Injectable()
export class PermissionService {
  // Retorna todas as permissões de um role
  getUserPermissions(role: UserRole): Permission[] { }
  
  // Verifica 1 permissão
  hasPermission(role: UserRole, permission: Permission): boolean { }
  
  // Verifica todas (AND logic)
  hasAllPermissions(role: UserRole, permissions: Permission[]): boolean { }
  
  // Verifica qualquer uma (OR logic)
  hasAnyPermission(role: UserRole, permissions: Permission[]): boolean { }
  
  // Descrição em português
  getPermissionDescription(permission: Permission): string { }
  
  // Agrupa por categoria
  getAllPermissionsGrouped(): Record<string, Permission[]> { }
}
```

### **4. Decoradores**

```typescript
// @Permissions() - OR logic (default)
@Permissions(Permission.PROJECT_READ, Permission.ADMIN_FULL_ACCESS)

// @RequireAllPermissions() - AND logic (todas requeridas)
@RequireAllPermissions(Permission.ADMIN_FULL_ACCESS, Permission.ADMIN_VIEW_AUDIT)

// @RequireAnyPermission() - OR logic explícito
@RequireAnyPermission(Permission.ADMIN_FULL_ACCESS, Permission.PROJECT_CREATE)
```

### **5. PermissionsGuard**

```typescript
@Injectable()
export class PermissionsGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    // 1. Extrai permissions da metadata
    // 2. Se nenhuma requerida, permite
    // 3. Valida user está autenticado
    // 4. Checa permissões
    // 5. Lança ForbiddenException se falhar
  }
}
```

---

## 🛡️ Permissões Disponíveis

### **Categoria: AUTENTICAÇÃO (4 permissões)**
```
AUTH_LOGIN        - Fazer login
AUTH_REGISTER     - Registrar novo usuário
AUTH_REFRESH      - Renovar token de acesso
AUTH_LOGOUT       - Fazer logout
```

### **Categoria: USUÁRIOS (7 permissões)**
```
USER_LIST         - Listar usuários
USER_CREATE       - Criar novo usuário
USER_READ         - Visualizar dados de um usuário
USER_UPDATE       - Atualizar dados de usuário
USER_DELETE       - Deletar usuário
USER_CHANGE_ROLE  - Mudar role de um usuário
USER_VIEW_STATS   - Visualizar estatísticas por role
```

### **Categoria: PROJETOS (7 permissões)**
```
PROJECT_LIST      - Listar projetos
PROJECT_CREATE    - Criar projeto
PROJECT_READ      - Visualizar projeto
PROJECT_UPDATE    - Atualizar projeto
PROJECT_DELETE    - Deletar projeto
PROJECT_EXPORT    - Exportar dados de projeto
PROJECT_FORECAST  - Gerar forecasts
```

### **Categoria: RECURSOS (7 permissões)**
```
RESOURCE_LIST            - Listar recursos
RESOURCE_CREATE          - Criar recurso
RESOURCE_READ            - Visualizar recurso
RESOURCE_UPDATE          - Atualizar recurso
RESOURCE_DELETE          - Deletar recurso
RESOURCE_MANAGE_JORNADA  - Gerenciar jornada de trabalho
RESOURCE_BULK_UPDATE     - Atualizar múltiplos recursos
```

### **Categoria: FINANCEIRO (7 permissões)**
```
FINANCIAL_LIST           - Listar dados financeiros
FINANCIAL_CREATE         - Criar registro financeiro
FINANCIAL_READ           - Visualizar dados financeiros
FINANCIAL_UPDATE         - Atualizar dados financeiros
FINANCIAL_DELETE         - Deletar dados financeiros
FINANCIAL_APPROVE        - Aprovar operações financeiras
FINANCIAL_VIEW_REPORTS   - Gerar relatórios
```

### **Categoria: CONFIGURAÇÃO (4 permissões)**
```
CONFIG_CALENDAR          - Gerenciar calendário
CONFIG_SINDICATO         - Gerenciar dados sindicais
CONFIG_INDICES           - Atualizar índices financeiros
CONFIG_SYSTEM            - Configurações gerais do sistema
```

### **Categoria: DASHBOARDS (4 permissões)**
```
DASHBOARD_EXECUTIVE      - Acessar dashboard executivo
DASHBOARD_FINANCIAL      - Acessar dashboard financeiro
DASHBOARD_RESOURCES      - Acessar dashboard de recursos
DASHBOARD_PROJECTS       - Acessar dashboard de projetos
```

### **Categoria: ADMINISTRAÇÃO (3 permissões)**
```
ADMIN_FULL_ACCESS        - Acesso total (superpermissão)
ADMIN_VIEW_AUDIT         - Visualizar logs de auditoria
ADMIN_MANAGE_PERMISSIONS - Gerenciar permissões
```

---

## 👥 Roles e Mapeamentos

### **Hierarquia de Roles**

```
┌─────────────────────────────────────────────┐
│             ADMIN (40+ perms)               │  Superusuário
│  Todas as permissões                        │
└─────────────────────────────────────────────┘
    ↓
┌─────────────────────────────────────────────┐
│  PMO (25+)  │ HR (12+)  │  FINANCE (12+)    │  Gestores
│  Project    │ Resource  │  Financial        │
│  Management │ Mgmt      │  Management       │
└─────────────────────────────────────────────┘
    ↓
┌─────────────────────────────────────────────┐
│   PROJECT_MANAGER (10+)                     │  PMs específicos
│   Seus projetos + recursos                  │
└─────────────────────────────────────────────┘
    ↓
┌─────────────────────────────────────────────┐
│         VIEWER (6+ - read-only)             │  Consultores
│         Dados públicos apenas                │
└─────────────────────────────────────────────┘
```

### **Matriz de Permissões Completa**

| Permissão | ADMIN | PMO | PM | HR | FINANCE | VIEWER |
|-----------|-------|-----|----|----|---------|--------|
| AUTH_LOGIN | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| USER_LIST | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| PROJECT_CREATE | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| PROJECT_READ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| RESOURCE_UPDATE | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ |
| FINANCIAL_APPROVE | ✅ | ❌ | ❌ | ❌ | ✅ | ❌ |
| DASHBOARD_EXECUTIVE | ✅ | ✅ | ❌ | ❌ | ✅ | ❌ |
| ADMIN_FULL_ACCESS | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |

---

## 🚀 Como Usar

### **Passo 1: Importar Permission e Decoradores**

```typescript
import { Permission } from '@/modules/auth/permissions';
import { Permissions, RequireAllPermissions, RequireAnyPermission } from '@/modules/auth/permissions';
import { PermissionsGuard } from '@/modules/auth/permissions';
```

### **Passo 2: Adicionar Decoradores na Rota**

```typescript
@Controller('projects')
export class ProjectsController {
  
  // Opção 1: Single permission (OR)
  @Get()
  @Permissions(Permission.PROJECT_READ)
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  async list() { }
  
  // Opção 2: Multiple permissions (OR - qualquer uma basta)
  @Get('dashboard')
  @Permissions(Permission.DASHBOARD_EXECUTIVE, Permission.DASHBOARD_PROJECTS)
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  async getDashboard() { }
  
  // Opção 3: AND logic (todas requeridas)
  @Post('sensitive')
  @RequireAllPermissions(Permission.PROJECT_CREATE, Permission.ADMIN_VIEW_AUDIT)
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  async sensitiveOperation() { }
}
```

### **Passo 3: Injetar PermissionService (opcional)**

```typescript
@Injectable()
export class MyService {
  constructor(
    private permissionService: PermissionService,
    private userService: UsersService
  ) {}
  
  async checkPermission(userId: string, permission: Permission) {
    const user = await this.userService.findById(userId);
    return this.permissionService.hasPermission(user.role, permission);
  }
  
  async getAllMyPermissions(userId: string) {
    const user = await this.userService.findById(userId);
    return this.permissionService.getUserPermissions(user.role);
  }
}
```

---

## 💡 Exemplos Práticos

### **Exemplo 1: CRUD Completo com Permissions**

```typescript
@Controller('users')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class UsersController {
  
  // Listar - Qualquer admin/gerente
  @Get()
  @Permissions(Permission.USER_LIST)
  async findAll(@Query() pagination: PaginationDto) {
    return this.usersService.findAll(pagination);
  }
  
  // Detalhe - Precisar de USER_READ
  @Get(':id')
  @Permissions(Permission.USER_READ)
  async findById(@Param('id') id: string) {
    return this.usersService.findById(id);
  }
  
  // Criar - Apenas admin PMO
  @Post()
  @Permissions(Permission.USER_CREATE)
  async create(@Body() dto: CreateUserDto) {
    return this.usersService.create(dto);
  }
  
  // Atualizar - Apenas admin
  @Put(':id')
  @Permissions(Permission.USER_UPDATE)
  async update(@Param('id') id: string, @Body() dto: UpdateUserDto) {
    return this.usersService.update(id, dto);
  }
  
  // Deletar - Apenas admin
  @Delete(':id')
  @Permissions(Permission.USER_DELETE)
  async delete(@Param('id') id: string) {
    return this.usersService.delete(id);
  }
  
  // Mudar role - Apenas admin
  @Post(':id/change-role')
  @Permissions(Permission.USER_CHANGE_ROLE)
  async changeRole(@Param('id') id: string, @Body() dto: ChangeRoleDto) {
    return this.usersService.changeRole(id, dto.role);
  }
}
```

### **Exemplo 2: Múltiplas Permissões - OR**

```typescript
@Get('settings')
@Permissions(
  Permission.CONFIG_CALENDAR,
  Permission.CONFIG_SINDICATO,
  Permission.CONFIG_INDICES,
  Permission.ADMIN_FULL_ACCESS
)
@UseGuards(JwtAuthGuard, PermissionsGuard)
async getSettings() {
  // Qualquer uma das permissões é suficiente
  return this.configService.getAll();
}
```

### **Exemplo 3: Múltiplas Permissões - AND**

```typescript
@Post('approve-and-audit')
@RequireAllPermissions(
  Permission.FINANCIAL_APPROVE,
  Permission.ADMIN_VIEW_AUDIT
)
@UseGuards(JwtAuthGuard, PermissionsGuard)
async approveAndAudit(@Body() dto: ApproveDto) {
  // Ambas as permissões são OBRIGATÓRIAS
  return this.financialService.approveAndAudit(dto);
}
```

### **Exemplo 4: Lógica Condicional no Controller**

```typescript
@Injectable()
export class ProjectsService {
  constructor(
    private permissionService: PermissionService,
    private usersService: UsersService
  ) {}
  
  async getProjects(userId: string) {
    const user = await this.usersService.findById(userId);
    
    if (this.permissionService.hasPermission(user.role, Permission.PROJECT_READ)) {
      // Se tem permissão, retorna todos
      return this.projectsRepository.findAll();
    } else if (user.role === UserRole.PROJECT_MANAGER) {
      // Se PM, apenas seus projetos
      return this.projectsRepository.findByPM(userId);
    } else {
      throw new ForbiddenException('Acesso negado');
    }
  }
}
```

### **Exemplo 5: Verificar Múltiplas Permissões**

```typescript
@Injectable()
export class FinancialService {
  constructor(private permissionService: PermissionService) {}
  
  async approveOperation(role: UserRole, operation: FinancialOperation) {
    // Verificar uma permissão
    if (!this.permissionService.hasPermission(role, Permission.FINANCIAL_APPROVE)) {
      throw new ForbiddenException('Sem permissão para aprovar');
    }
    
    // Verificar todas
    if (!this.permissionService.hasAllPermissions(role, [
      Permission.FINANCIAL_APPROVE,
      Permission.ADMIN_VIEW_AUDIT
    ])) {
      throw new ForbiddenException('Sem todas as permissões requeridas');
    }
    
    // Verificar qualquer uma
    if (!this.permissionService.hasAnyPermission(role, [
      Permission.ADMIN_FULL_ACCESS,
      Permission.FINANCIAL_APPROVE
    ])) {
      throw new ForbiddenException('Sem nenhuma permissão válida');
    }
    
    // Passou em todas as validações
    return this.approve(operation);
  }
}
```

---

## 🔍 Troubleshooting

### **Problema 1: "Acesso negado" em rota que deveria ter permissão**

**Razão**: Decoradores não aplicados corretamente

**Solução**:
```typescript
// ❌ Errado - faltam guards
@Get()
@Permissions(Permission.USER_LIST)
async list() { }

// ✅ Correto
@Get()
@Permissions(Permission.USER_LIST)
@UseGuards(JwtAuthGuard, PermissionsGuard)
async list() { }
```

### **Problema 2: Token não está sendo validado**

**Razão**: Estratégia JWT não registrada

**Solução**: Verificar que `auth.module.ts` tem:
```typescript
@Module({
  imports: [
    PassportModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '1h' }
    })
  ],
  providers: [AuthService, JwtStrategy, JwtAuthGuard, PermissionService, PermissionsGuard],
  exports: [AuthService, PermissionService, PermissionsGuard]
})
export class AuthModule { }
```

### **Problema 3: "ForbiddenException: Permissões requeridas não encontradas"**

**Razão**: Decorador não aplicado ou permission inválida

**Solução**:
```typescript
// ✅ Verificar que permission existe em enum
@Permissions(Permission.USER_LIST) // Permission.USER_LIST deve existir

// ✅ Ou verificar no PermissionService.spec.ts que role tem permissão
const perms = permissionService.getUserPermissions(UserRole.PMO);
console.log(perms); // Deve incluir a permissão requerida
```

### **Problema 4: OR vs AND logic não funciona**

**Razão**: Decorador errado

**Solução**:
```typescript
// ✅ OR logic (qualify qualquer uma)
@Permissions(Permission.A, Permission.B, Permission.C)

// ✅ AND logic (todas requeridas)
@RequireAllPermissions(Permission.A, Permission.B, Permission.C)

// ❌ Não faça
@Permissions(Permission.A)
@Permissions(Permission.B) // Somente última é aplicada
```

### **Problema 5: Mensagem de erro não clara**

**Solução**: ForbiddenException deve ter detalhes de qual permissão falhou
```
ForbiddenException: User role 'VIEWER' missing permissions: project:update, project:delete (required: any)
```

Se a mensagem não está clara, verificar `permissions.guard.ts`

---

## ✨ Best Practices

### **1. Sempre Use Guards no Controller**
```typescript
// ✅ Correto
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class ProjectsController { }

// ❌ Evitar
export class ProjectsController { }
```

### **2. Permissão por Rota, Não por Controller**

Se diferentes rotas precisam diferentes permissões:
```typescript
// ✅ Bom
@Get()
@Permissions(Permission.PROJECT_READ)
@UseGuards(JwtAuthGuard, PermissionsGuard)
getAll() { }

@Post()
@Permissions(Permission.PROJECT_CREATE)
@UseGuards(JwtAuthGuard, PermissionsGuard)
create() { }

// ❌ Evitar - aplicar guard só no nível do controller
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class ProjectsController {
  @Get() getAll() { }
  @Post() create() { }
}
```

### **3. Use AND Logic com Cuidado**

AND logic é mais restritivo, use quando realmente ambas as permissões são requeridas:
```typescript
// ✅ Faz sentido - ambas são requeridas
@RequireAllPermissions(
  Permission.FINANCIAL_APPROVE,  // Pode aprovar
  Permission.ADMIN_VIEW_AUDIT    // Pode ver evidências
)

// ❌ Evitar - restritivo demais
@RequireAllPermissions(
  Permission.PROJECT_READ,       // Ler projetos
  Permission.USER_READ           // Ler usuários
)
```

### **4. Organize Permissões por Domínio**

```typescript
// ✅ Agrupado logicamente
export enum Permission {
  // PROJECT domain
  PROJECT_LIST = 'project:list',
  PROJECT_CREATE = 'project:create',
  PROJECT_READ = 'project:read',
  // ...
  
  // USER domain
  USER_LIST = 'user:list',
  USER_CREATE = 'user:create',
  // ...
}
```

### **5. Documente Permissões Requeridas em Swagger**

```typescript
@ApiOperation({ summary: 'Listar projetos' })
@ApiUnauthorizedResponse({ description: 'Acesso não autenticado' })
@ApiForbiddenResponse({ description: 'Sem permissão PROJECT_READ' })
@Get()
@Permissions(Permission.PROJECT_READ)
@UseGuards(JwtAuthGuard, PermissionsGuard)
async list() { }
```

### **6. Use PermissionService para Lógica Complexa**

```typescript
// ✅ Quando precisa verificar programaticamente
@Injectable()
export class MyService {
  constructor(private permissionService: PermissionService) {}
  
  async doSomething(user: User) {
    if (!this.permissionService.hasPermission(user.role, Permission.PROJECT_UPDATE)) {
      return this.infoOnly(user); // Versão limitada
    }
    return this.fullFunctionality(user);
  }
}
```

### **7. Sempre Testes as Permissões**

```typescript
// permission.service.spec.ts
describe('PermissionService', () => {
  it('PMO user should have PROJECT_CREATE', () => {
    const perms = permissionService.getUserPermissions(UserRole.PMO);
    expect(perms).toContain(Permission.PROJECT_CREATE);
  });
  
  it('VIEWER should NOT have PROJECT_CREATE', () => {
    const perms = permissionService.getUserPermissions(UserRole.VIEWER);
    expect(perms).not.toContain(Permission.PROJECT_CREATE);
  });
});
```

### **8. Mensagens de Erro Úteis**

```typescript
// ✅ Bom - usuário sabe o que faltou
throw new ForbiddenException(
  `User with role ${user.role} needs one of: ${requiredPermissions.join(', ')}`
);

// ❌ Evitar - vago
throw new ForbiddenException('Access denied');
```

---

## 📊 Checklista para Implementar RBAC em Nova Funcionalidade

- [ ] Identificar permissões necessárias (não deixar tudo no ADMIN)
- [ ] Adicionar permissões ao enum `Permission`
- [ ] Atualizar `ROLE_PERMISSIONS` com mapeamento
- [ ] Criar rota com `@Permissions()` ou `@RequireAllPermissions()`
- [ ] Aplicar `@UseGuards(JwtAuthGuard, PermissionsGuard)`
- [ ] Escrever testes em `permission.service.spec.ts`
- [ ] Documentar em commit message
- [ ] Testar manualmente com cURL (ver abaixo)
- [ ] Adicionar a documentação Swagger

### **Teste com cURL**

```bash
# 1. Login como admin
ADMIN_TOKEN=$(curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@sistema.com","password":"Admin123!"}' \
  | jq -r '.access_token')

# 2. Fazer requisição com token
curl -H "Authorization: Bearer $ADMIN_TOKEN" \
  http://localhost:3000/api/resource

# Se <200, Sucesso ✅
# Se 403, Falta permissão ❌
# Se 401, Token inválido ❌
```

---

## 🔗 Referências Relacionadas

- [auth.service.ts](../../apps/backend/src/modules/auth/auth.service.ts) - Lógica de autenticação
- [permission.service.ts](../../apps/backend/src/modules/auth/permissions/permission.service.ts) - Lógica de permissões
- [permission.service.spec.ts](../../apps/backend/src/modules/auth/permissions/permission.service.spec.ts) - Testes de permissões
- [permissions.guard.ts](../../apps/backend/src/modules/auth/permissions/permissions.guard.ts) - Guard de proteção
- [SPRINT_2_RBAC_VALIDATION.md](./SPRINT_2_RBAC_VALIDATION.md) - Guia de validação

---

**Última Atualização**: 01/03/2026  
**Status**: Complete & Production Ready  
**Questions**: Ver seção Troubleshooting acima
