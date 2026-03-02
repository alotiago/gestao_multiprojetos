# Plano de Suporte Pós Go-Live

**Projeto:** Gestor Multiprojetos  
**Período:** 1 mês após o Go-Live

---

## 1. Níveis de Suporte

### Nível 1 — Suporte ao Usuário

| Item | Detalhe |
|---|---|
| **Responsável** | Help Desk / Administrador do sistema |
| **Escopo** | Dúvidas de uso, reset de senha, problemas de acesso |
| **SLA** | Resposta em até 4 horas úteis |
| **Canal** | Email / Chat interno |

**Procedimentos:**
- Verificar se o problema é de uso (consultar Manual do Usuário)
- Verificar status do sistema (`/health`)
- Reset de senha via admin
- Escalar para Nível 2 se necessário

### Nível 2 — Suporte Técnico

| Item | Detalhe |
|---|---|
| **Responsável** | Equipe de TI / DevOps |
| **Escopo** | Problemas técnicos, bugs, performance |
| **SLA** | Resolução em até 24 horas úteis |
| **Canal** | Sistema de tickets |

**Procedimentos:**
- Consultar logs: `docker compose logs backend`
- Verificar métricas no Grafana
- Reiniciar containers se necessário
- Escalar para Nível 3 se necessário

### Nível 3 — Desenvolvimento

| Item | Detalhe |
|---|---|
| **Responsável** | Equipe de Desenvolvimento |
| **Escopo** | Bugs complexos, novas funcionalidades |
| **SLA** | Análise em até 48 horas úteis |
| **Canal** | Repositório Git (issues) |

---

## 2. Procedimentos de Emergência

### Sistema Fora do Ar

1. Verificar containers: `docker compose ps`
2. Verificar health: `curl http://servidor:3001/health`
3. Reiniciar: `docker compose restart`
4. Se persistir: `docker compose down && docker compose up -d`
5. Verificar logs: `docker compose logs -f --tail=100`

### Banco de Dados Corrompido

1. Parar sistema: `docker compose stop backend frontend`
2. Restaurar backup: `cat backup_YYYYMMDD.sql | docker compose exec -T postgres psql -U gestor_admin gestor_multiprojetos`
3. Reiniciar: `docker compose up -d`
4. Validar dados

### Ataque de Segurança Suspeito

1. Verificar logs de login falho no backend
2. Verificar padrões anômalos no Grafana
3. Bloquear IPs suspeitos no nginx
4. Revogar tokens: reiniciar backend (invalida JWT)
5. Alterar senhas administrativas

---

## 3. Backup e Recuperação

### Rotina de Backup

| Tipo | Frequência | Retenção |
|---|---|---|
| Full backup DB | Diário (2h) | 30 dias |
| Incremental DB | A cada 6 horas | 7 dias |
| Volumes Docker | Semanal | 4 semanas |

### Comandos de Backup

```bash
# Backup manual
docker compose exec postgres pg_dump -U gestor_admin -Fc gestor_multiprojetos > backup_$(date +%Y%m%d_%H%M).dump

# Restore
docker compose exec -T postgres pg_restore -U gestor_admin -d gestor_multiprojetos < backup.dump
```

### Script de Backup Automatizado (cron)

```bash
# Adicionar ao crontab: crontab -e
0 2 * * * /opt/gestor/scripts/backup.sh >> /var/log/gestor-backup.log 2>&1
```

---

## 4. Monitoramento

### Health Checks

| Endpoint | Intervalo | Alerta |
|---|---|---|
| `GET /health` | 1 min | Se falhar 3x consecutivas |
| PostgreSQL | 30s | Se conexões > 80% |
| Redis | 30s | Se memória > 90% |
| Nginx | 1 min | Se 5xx > 1% |

### Dashboards Grafana

1. **System Overview** — CPU, memória, disco dos containers
2. **API Performance** — Response times, error rates, throughput
3. **Database** — Conexões, queries lentas, tamanho
4. **Security** — Logins falhos, rate limit hits

---

## 5. Escalação

```
Usuário → Nível 1 (Help Desk)
             │
             ├─ Resolvido → Fechar ticket
             │
             └─ Não resolvido → Nível 2 (TI/DevOps)
                                    │
                                    ├─ Resolvido → Fechar ticket
                                    │
                                    └─ Não resolvido → Nível 3 (Dev)
                                                          │
                                                          └─ Hotfix / Sprint
```

---

## 6. Contatos

| Responsável | Função | Contato |
|---|---|---|
| (Nome) | Administrador do Sistema | email@empresa.com |
| (Nome) | DevOps / Infraestrutura | email@empresa.com |
| (Nome) | Desenvolvimento | email@empresa.com |
| (Nome) | Product Owner | email@empresa.com |

---

*Plano de Suporte Pós Go-Live — Gestor Multiprojetos v1.0*
