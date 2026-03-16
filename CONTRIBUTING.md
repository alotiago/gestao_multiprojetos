# Guia de Contribuição

Obrigado por se interessar em contribuir com o **Gestão de Multiprojetos**! 🎉  
Este guia descreve o processo e as diretrizes para contribuir com o projeto.

---

## 📋 Índice

- [Código de Conduta](#código-de-conduta)
- [Como Posso Contribuir?](#como-posso-contribuir)
- [Configuração do Ambiente](#configuração-do-ambiente)
- [Fluxo de Trabalho com Git](#fluxo-de-trabalho-com-git)
- [Padrões de Commit](#padrões-de-commit)
- [Padrões de Código](#padrões-de-código)
- [Pull Requests](#pull-requests)
- [Reportando Bugs](#reportando-bugs)
- [Sugerindo Funcionalidades](#sugerindo-funcionalidades)

---

## 📜 Código de Conduta

Este projeto adota o [Código de Conduta do Contributor Covenant](CODE_OF_CONDUCT.md).  
Ao participar, você concorda em respeitá-lo. Comportamentos inaceitáveis podem ser reportados em **alotalves@gmail.com**.

---

## 💡 Como Posso Contribuir?

Existem várias formas de contribuir com o projeto:

- 🐛 **Reportar bugs** — Abra uma [issue](https://github.com/alotiago/gestao_multiprojetos/issues/new?template=bug_report.md)
- 💡 **Sugerir funcionalidades** — Abra uma [issue](https://github.com/alotiago/gestao_multiprojetos/issues/new?template=feature_request.md)
- 📝 **Melhorar a documentação** — Corrija erros, adicione exemplos ou traduções
- 🛠 **Implementar funcionalidades** — Resolva issues abertas ou proponha melhorias
- 🔍 **Revisar Pull Requests** — Ajude a revisar o código de outros colaboradores

---

## ⚙️ Configuração do Ambiente

Consulte o [Guia de Desenvolvimento](docs/guia_desenvolvimento.md) para instruções detalhadas sobre como configurar o ambiente de desenvolvimento.

---

## 🌿 Fluxo de Trabalho com Git

Este projeto utiliza o modelo **GitHub Flow**:

1. **Fork** — Faça um fork do repositório para sua conta GitHub.

2. **Clone** — Clone o fork localmente:
   ```bash
   git clone https://github.com/SEU_USUARIO/gestao_multiprojetos.git
   cd gestao_multiprojetos
   ```

3. **Upstream** — Adicione o repositório original como remote:
   ```bash
   git remote add upstream https://github.com/alotiago/gestao_multiprojetos.git
   ```

4. **Branch** — Crie uma branch descritiva a partir de `main`:
   ```bash
   git checkout -b tipo/descricao-curta
   # Exemplos:
   # feature/cadastro-projetos
   # fix/calculo-prazo
   # docs/atualiza-readme
   ```

5. **Develop** — Implemente suas mudanças seguindo os [Padrões de Código](#padrões-de-código).

6. **Commit** — Faça commits seguindo os [Padrões de Commit](#padrões-de-commit).

7. **Sync** — Mantenha sua branch atualizada:
   ```bash
   git fetch upstream
   git rebase upstream/main
   ```

8. **Push** — Envie sua branch para o fork:
   ```bash
   git push origin tipo/descricao-curta
   ```

9. **Pull Request** — Abra um PR no repositório original descrevendo suas mudanças.

---

## 📝 Padrões de Commit

Este projeto segue o padrão [Conventional Commits](https://www.conventionalcommits.org/pt-br/v1.0.0/).

### Formato

```
<tipo>(<escopo opcional>): <descrição curta>

[corpo opcional]

[rodapé(s) opcional(is)]
```

### Tipos

| Tipo | Uso |
|---|---|
| `feat` | Nova funcionalidade |
| `fix` | Correção de bug |
| `docs` | Apenas alterações em documentação |
| `style` | Formatação, ponto e vírgula faltando, etc. (sem mudança de lógica) |
| `refactor` | Refatoração de código sem correção de bug ou nova funcionalidade |
| `test` | Adição ou correção de testes |
| `chore` | Manutenção de build, configurações, dependências, etc. |
| `perf` | Melhoria de desempenho |
| `ci` | Mudanças em arquivos e scripts de CI/CD |

### Exemplos

```
feat(projetos): adiciona endpoint para criação de projeto
fix(tarefas): corrige cálculo de prazo em tarefas recorrentes
docs: atualiza guia de instalação no README
test(usuarios): adiciona testes unitários para autenticação
```

---

## 🎨 Padrões de Código

- Siga os padrões e convenções da linguagem utilizada no projeto.
- Escreva código legível com nomes de variáveis e funções descritivos.
- Adicione comentários apenas quando necessário para explicar lógica complexa.
- Escreva testes para todas as novas funcionalidades e correções de bugs.
- Garanta que todos os testes existentes passem antes de abrir um PR.
- Utilize o linter e formatador de código configurados no projeto.

---

## 🔀 Pull Requests

Ao abrir um Pull Request:

1. **Título** — Use o mesmo formato dos commits convencionais.
2. **Descrição** — Explique **o quê** e **por quê**, não o como.
3. **Referência** — Mencione a issue relacionada com `Closes #NNN` ou `Relates to #NNN`.
4. **Checklist** — Confirme que:
   - [ ] O código segue os padrões do projeto
   - [ ] Testes foram adicionados ou atualizados
   - [ ] A documentação foi atualizada (se necessário)
   - [ ] O CHANGELOG foi atualizado
   - [ ] Todos os testes passam localmente

### Revisão

- PRs precisam de pelo menos **1 aprovação** para ser mergeado.
- O autor do PR é responsável por resolver os comentários de revisão.
- Após a aprovação e merge, a branch de feature deve ser deletada.

---

## 🐛 Reportando Bugs

Antes de reportar um bug, verifique se ele já não foi reportado nas [issues abertas](https://github.com/alotiago/gestao_multiprojetos/issues).

Ao reportar um bug, inclua:

- **Título claro e descritivo**
- **Passos para reproduzir** o problema
- **Comportamento esperado** vs. **comportamento atual**
- **Screenshots** (se aplicável)
- **Ambiente:** sistema operacional, versão do browser/runtime, etc.

---

## 💡 Sugerindo Funcionalidades

Ao sugerir uma nova funcionalidade:

- Verifique se já existe uma issue para ela.
- Descreva claramente **o problema** que a funcionalidade resolve.
- Explique como você imagina a solução.
- Liste possíveis alternativas consideradas.

---

Obrigado por contribuir! Sua ajuda é fundamental para tornar este projeto melhor. 🚀
