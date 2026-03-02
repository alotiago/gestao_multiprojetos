# 🚀 Instalação Local - Windows (Sem Docker)

**Data**: 01/03/2026  
**Ambiente**: Windows 11 / Windows Server  
**Status**: Configuração automática

---

## 1️⃣ Instalar PostgreSQL Standalone

### Opção A: Download Manual (Recomendado)
1. Acesse: https://www.postgresql.org/download/windows/
2. Baixe versão **16.x** (compatível com schema)
3. Execute instalador com:
   - **Porta**: 5432
   - **Username**: admin
   - **Password**: ChangeMe123!
   - **Superuser**: ✅
4. Adicionar ao PATH do sistema

### Opção B: Instalação via Chocolatey
```powershell
choco install postgresql --version=16.0 -y
```

### Opção C: Instalação via Scoop
```powershell
scoop install postgresql
```

---

## 2️⃣ Verificar Instalação

```powershell
# Verificar versão
psql --version

# Conectar ao servidor
psql -U admin -d postgres -c "SELECT version();"
```

**Expected**: PostgreSQL 16.x rodando

---

## 3️⃣ Criar Banco de Dados

```powershell
# Conectar como super-user
psql -U admin -d postgres

# Dentro do psql, executar:
CREATE DATABASE gestor_multiprojetos;
CREATE USER gestor WITH PASSWORD 'ChangeMe123!';
GRANT ALL PRIVILEGES ON DATABASE gestor_multiprojetos TO gestor;
ALTER DATABASE gestor_multiprojetos OWNER TO gestor;
\q
```

**Verificar**:
```powershell
psql -U admin -d gestor_multiprojetos -c "\dt"
```

---

## 4️⃣ Configurar .env

Atualizar `c:\des\gestor_multiprojetos\.env`:

```env
# === DATABASE ===
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_NAME=gestor_multiprojetos
DATABASE_USER=admin
DATABASE_PASSWORD=ChangeMe123!
DATABASE_URL=postgresql://admin:ChangeMe123!@localhost:5432/gestor_multiprojetos?schema=public

# === REDIS (Opcional para dev) ===
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_URL=redis://localhost:6379

# === APP ===
NODE_ENV=development
JWT_SECRET=your-jwt-secret-key-change-in-prod
JWT_EXPIRATION=24h
NEXT_PUBLIC_API_URL=http://localhost:3001
```

---

## 5️⃣ Instalar Redis (Opcional)

### Para Windows:
```powershell
# Opção A: Via Chocolatey
choco install redis -y

# Opção B: Via WSL2
wsl --install Ubuntu
wsl sudo apt-get install redis-server
```

**Verificar**:
```powershell
redis-cli ping
```
Esperado: `PONG`

---

## 6️⃣ Setup do Projeto

```powershell
cd c:\des\gestor_multiprojetos

# Instalar dependências
npm install

# Gerar cliente Prisma
cd apps\backend
npx prisma generate
npx prisma migrate dev --name init
npx prisma db seed
cd ..\..

# Executar testes
npm run test

# Rodar em desenvolvimento
npm run dev
```

---

## 🎯 URLs Esperadas

| Serviço       | URL                  | Status |
|---------------|----------------------|--------|
| Frontend      | http://localhost:3000   | ✅ Next.js |
| Backend API   | http://localhost:3001   | ✅ NestJS |
| PostgreSQL    | localhost:5432         | ✅ Local |
| Redis         | localhost:6379         | ⚠️ Opcional |

---

## 📊 Troubleshooting

### "psql: command not found"
→ Adicionar PostgreSQL ao PATH:
```powershell
setx PATH "$env:PATH;C:\Program Files\PostgreSQL\16\bin"
$env:PATH = [System.Environment]::GetEnvironmentVariable("PATH","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("PATH","User")
```

### Porta 5432 em uso
```powershell
netstat -ano | findstr :5432
taskkill /PID <PID> /F
```

### Conexão recusada
```powershell
# Reiniciar serviço PostgreSQL
Restart-Service PostgreSQL-x64-16
```

---

## ✅ Próximos Passos

Após instalação bem-sucedida:
1. ✅ Executar testes (92 devem passar)
2. ✅ Acessar http://localhost:3000
3. ✅ Login com: admin@sistema.com / Admin123!
4. ✅ Validar Sprint 1 + 2
