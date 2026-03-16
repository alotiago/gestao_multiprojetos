# Guia de Desenvolvimento

> **Última atualização:** 2026-03

---

## 📋 Índice

- [Pré-requisitos](#pré-requisitos)
- [Configuração do Ambiente](#configuração-do-ambiente)
- [Estrutura do Projeto](#estrutura-do-projeto)
- [Fluxo de Desenvolvimento](#fluxo-de-desenvolvimento)
- [Padrões de Código](#padrões-de-código)
- [Testes](#testes)
- [Variáveis de Ambiente](#variáveis-de-ambiente)
- [Banco de Dados](#banco-de-dados)
- [Execução Local](#execução-local)
- [Debugging](#debugging)
- [Implantação](#implantação)

---

## 🛠 Pré-requisitos

Antes de configurar o ambiente, certifique-se de ter instalado:

- [Git](https://git-scm.com/) (versão 2.x ou superior)
- Editor de código recomendado: [Visual Studio Code](https://code.visualstudio.com/)

> As demais dependências (linguagem, runtime, banco de dados) serão listadas aqui após a definição do stack tecnológico.  
> Consulte [docs/arquitetura.md](arquitetura.md) para acompanhar as decisões técnicas.

---

## ⚙️ Configuração do Ambiente

### 1. Clone o repositório

```bash
git clone https://github.com/alotiago/gestao_multiprojetos.git
cd gestao_multiprojetos
```

### 2. Configure as variáveis de ambiente

Copie o arquivo de exemplo e preencha com as configurações do seu ambiente local:

```bash
cp .env.example .env
```

Edite o arquivo `.env` conforme necessário. Consulte a seção [Variáveis de Ambiente](#variáveis-de-ambiente) para detalhes.

### 3. Instale as dependências

> *As instruções específicas serão adicionadas após a definição do stack.*

```bash
# Exemplo para projetos Node.js:
npm install

# Exemplo para projetos Python:
pip install -r requirements.txt
```

### 4. Configure o banco de dados

```bash
# Execute as migrações
# (comandos específicos serão definidos conforme o stack escolhido)
```

### 5. Inicie o servidor de desenvolvimento

```bash
# Comandos específicos serão adicionados conforme o stack
```

---

## 📁 Estrutura do Projeto

```
gestao_multiprojetos/
├── docs/                        # Documentação detalhada
│   ├── arquitetura.md
│   ├── requisitos.md
│   ├── guia_desenvolvimento.md  # Este arquivo
│   └── api.md
├── src/                         # Código-fonte principal
│   ├── auth/                    # Módulo de autenticação
│   ├── projetos/                # Módulo de projetos
│   ├── tarefas/                 # Módulo de tarefas
│   ├── equipes/                 # Módulo de equipes e recursos
│   ├── dashboard/               # Módulo de dashboard e relatórios
│   ├── notificacoes/            # Módulo de notificações
│   └── config/                  # Configurações globais
├── tests/                       # Testes automatizados
│   ├── unit/                    # Testes unitários
│   ├── integration/             # Testes de integração
│   └── e2e/                     # Testes end-to-end
├── .env.example                 # Exemplo de variáveis de ambiente
├── CHANGELOG.md
├── CODE_OF_CONDUCT.md
├── CONTRIBUTING.md
├── LICENSE
└── README.md
```

---

## 🔄 Fluxo de Desenvolvimento

Este projeto segue o **GitHub Flow**. Para contribuir:

1. **Sincronize** sua branch `main` local com o repositório remoto:
   ```bash
   git checkout main
   git pull upstream main
   ```

2. **Crie** uma nova branch para sua funcionalidade ou correção:
   ```bash
   git checkout -b feature/nome-da-funcionalidade
   # ou
   git checkout -b fix/nome-do-bug
   ```

3. **Desenvolva** seguindo os padrões descritos abaixo.

4. **Teste** suas alterações:
   ```bash
   # Executa todos os testes
   # (comandos específicos serão definidos conforme o stack)
   ```

5. **Commit** usando o padrão [Conventional Commits](https://www.conventionalcommits.org/pt-br/):
   ```bash
   git commit -m "feat(projetos): adiciona criação de projeto com datas"
   ```

6. **Abra** um Pull Request descrevendo suas mudanças.

Para mais detalhes sobre o processo de contribuição, consulte [CONTRIBUTING.md](../CONTRIBUTING.md).

---

## 🎨 Padrões de Código

### Geral

- Nomes de variáveis e funções em **camelCase** ou **snake_case** conforme a convenção da linguagem.
- Nomes de classes em **PascalCase**.
- Constantes em **SCREAMING_SNAKE_CASE**.
- Indentação com **2 ou 4 espaços** (a definir conforme o stack escolhido). Nunca use tabs.
- Arquivos e pastas em **kebab-case** ou **snake_case** conforme a convenção do ecossistema.
- Comprimento máximo de linha: **120 caracteres**.

### Organização dos Módulos

Cada módulo deve seguir a mesma estrutura interna:

```
modulo/
├── controllers/   # Manipuladores de requisição HTTP
├── services/      # Lógica de negócio
├── repositories/  # Acesso ao banco de dados
├── models/        # Modelos/entidades de dados
├── dtos/          # Objetos de transferência de dados
└── tests/         # Testes do módulo
```

### Comentários

- Use comentários para explicar **por que**, não o quê.
- Documente funções e métodos públicos com o padrão JSDoc ou equivalente da linguagem.
- Evite comentários óbvios que apenas repetem o código.

---

## 🧪 Testes

O projeto adota a seguinte estratégia de testes:

| Tipo | Propósito | Localização |
|---|---|---|
| **Unitários** | Testar funções/classes isoladas | `tests/unit/` |
| **Integração** | Testar interação entre módulos e banco de dados | `tests/integration/` |
| **End-to-End** | Testar fluxos completos de usuário | `tests/e2e/` |

### Diretrizes

- **Cobertura mínima:** 80% do código
- Todo bug corrigido deve ter um teste de regressão
- Toda nova funcionalidade deve ter testes unitários e de integração
- Nomes de testes devem ser descritivos: `deve retornar erro quando projeto não existe`

### Executando Testes

```bash
# Todos os testes
# (comandos específicos a definir)

# Somente testes unitários
# (comandos específicos a definir)

# Com relatório de cobertura
# (comandos específicos a definir)
```

---

## 🔑 Variáveis de Ambiente

As variáveis de ambiente são gerenciadas via arquivo `.env` (não versionado).  
Um arquivo `.env.example` com todas as variáveis e descrições deve ser mantido atualizado.

### Variáveis Esperadas (proposta inicial)

```dotenv
# Aplicação
APP_ENV=development          # development | test | production
APP_PORT=3000
APP_SECRET_KEY=              # Chave secreta para assinatura de tokens

# Banco de Dados
DB_HOST=localhost
DB_PORT=5432
DB_NAME=gestao_multiprojetos
DB_USER=postgres
DB_PASSWORD=

# E-mail (para notificações)
MAIL_HOST=
MAIL_PORT=587
MAIL_USER=
MAIL_PASSWORD=
MAIL_FROM=noreply@gestao-multiprojetos.local

# Autenticação
JWT_SECRET=                  # Segredo para assinatura de JWT
JWT_EXPIRES_IN=8h
```

> **Nunca** commite arquivos `.env` com valores reais. Adicione `.env` ao `.gitignore`.

---

## 🗄️ Banco de Dados

### Migrações

O projeto utilizará um sistema de migrações para gerenciar a evolução do esquema do banco de dados.

- Toda alteração no banco de dados deve ser feita via migração versionada.
- Nunca altere diretamente o banco de dados de produção.
- Migrações devem ser idempotentes sempre que possível.

### Seeds

Dados de exemplo para desenvolvimento serão fornecidos via scripts de seed:

```bash
# Exemplo:
# npm run db:seed
# python manage.py loaddata seed.json
```

---

## ▶️ Execução Local

### Servidor de Desenvolvimento

```bash
# Iniciar o servidor (comandos específicos a definir conforme o stack)
```

O servidor estará disponível em `http://localhost:3000` (porta configurável via `APP_PORT`).

### Compilação para Produção

```bash
# Build de produção (comandos específicos a definir)
```

---

## 🐛 Debugging

- Utilize as ferramentas de debug do seu editor (VS Code tem excelente suporte).
- Logs de debug devem usar a biblioteca de logging configurada no projeto — evite `console.log` ou `print` soltos no código de produção.
- Para problemas de performance, utilize as ferramentas de profiling da linguagem.

---

## 🚀 Implantação

> As instruções de implantação serão documentadas após a definição da infraestrutura.

### Ambientes

| Ambiente | Propósito | URL |
|---|---|---|
| **Desenvolvimento** | Local do desenvolvedor | `http://localhost:3000` |
| **Homologação** | Testes e validação com stakeholders | A definir |
| **Produção** | Ambiente final para usuários | A definir |

### Checklist de Implantação

Antes de qualquer implantação em produção:

- [ ] Todos os testes passam
- [ ] Cobertura de testes está acima de 80%
- [ ] Revisão de código aprovada
- [ ] Variáveis de ambiente de produção configuradas
- [ ] Migrações de banco de dados preparadas
- [ ] CHANGELOG atualizado
- [ ] Tag de versão criada no Git

---

## 📚 Recursos Úteis

- [Conventional Commits](https://www.conventionalcommits.org/pt-br/)
- [Keep a Changelog](https://keepachangelog.com/pt-BR/)
- [Semantic Versioning](https://semver.org/lang/pt-BR/)
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
