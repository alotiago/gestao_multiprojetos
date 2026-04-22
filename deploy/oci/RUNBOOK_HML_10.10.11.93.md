# Runbook de Deploy - Homologacao VM 10.10.11.93

## Escopo
Este runbook cobre a criacao do ambiente de **homologacao** do Gestor Multiprojetos na VM `10.10.11.93`, com dominio `gestaodeprojetoshml.oais.cloud`, usando **HTTP**.

## Arquitetura
- `gestaodeprojetoshml.oais.cloud` -> host nginx -> `127.0.0.1:8081` (container nginx do GMP)
- Stack Docker GMP: `gmp-postgres`, `gmp-redis`, `gmp-backend`, `gmp-frontend`, `gmp-nginx`
- Compose: `docker-compose.oci.yml`

## 1. Preparacao inicial da VM (uma vez)
```bash
cd /opt
sudo apt-get update
sudo apt-get install -y git curl
```

Opcional (setup completo de pacotes):
```bash
cd /tmp
curl -fsSL https://raw.githubusercontent.com/alotiago/gestao_multiprojetos/master/deploy/oci/setup_vm.sh -o setup_vm.sh
sudo bash setup_vm.sh
```

## 2. Clonar repositorio
```bash
cd /opt
sudo git clone -b master https://github.com/alotiago/gestao_multiprojetos.git gestor_multiprojetos
cd /opt/gestor_multiprojetos
sudo chown -R $USER:$USER /opt/gestor_multiprojetos
```

## 3. Primeiro deploy HML
```bash
cd /opt/gestor_multiprojetos
sudo bash deploy/oci/full_deploy_vm.sh \
  --repo-url https://github.com/alotiago/gestao_multiprojetos.git \
  --branch master \
  --domain gestaodeprojetoshml.oais.cloud
```

## 4. Configurar gateway nginx do host (HTTP)
```bash
cd /opt/gestor_multiprojetos
sudo bash deploy/oci/setup_host_nginx_hml_http.sh --domain gestaodeprojetoshml.oais.cloud
```

## 5. Validacao
### Validacao interna
```bash
curl -s http://127.0.0.1:8081/health
curl -s http://127.0.0.1/health -H 'Host: gestaodeprojetoshml.oais.cloud'
```

### Validacao externa
```bash
curl -s http://gestaodeprojetoshml.oais.cloud/health
```

### Validacao funcional basica (API)
```bash
curl -s http://gestaodeprojetoshml.oais.cloud/api/health
```

## 5.1 Deploy a partir do Windows (sem digitar senha interativamente)
```powershell
$env:GMP_HML_VM_PASSWORD = 'SUA_SENHA_AQUI'
powershell -ExecutionPolicy Bypass -File c:\des\gestor_multiprojetos\deploy\oci\deploy_homolog_vm.ps1 -Execute
```

Ou passando por parametro:
```powershell
powershell -ExecutionPolicy Bypass -File c:\des\gestor_multiprojetos\deploy\oci\deploy_homolog_vm.ps1 -Execute -PlainTextPassword 'SUA_SENHA_AQUI'
```

Launcher local reutilizavel (ignorado no git):
```powershell
# modo seguro
powershell -ExecutionPolicy Bypass -File c:\des\gestor_multiprojetos\deploy\oci\deploy_homolog_vm.local.ps1

# execucao real
$env:GMP_HML_VM_PASSWORD = 'SUA_SENHA_AQUI'
powershell -ExecutionPolicy Bypass -File c:\des\gestor_multiprojetos\deploy\oci\deploy_homolog_vm.local.ps1 -Execute
```

## 6. Atualizacao de versao em HML
```bash
cd /opt/gestor_multiprojetos
sudo git fetch --all --prune
sudo git checkout master
sudo git pull --ff-only origin master
sudo docker compose -f docker-compose.oci.yml up -d --build
sudo docker exec gmp-backend sh -c 'cd /app/apps/backend && npx prisma migrate deploy --schema=prisma/schema.prisma'
```

## 7. Troubleshooting rapido
- Erro de schema Prisma (`column does not exist`, `relation does not exist`):
```bash
sudo docker compose -f docker-compose.oci.yml logs --tail=300 postgres backend | egrep 'column .* does not exist|relation .* does not exist'
```

- Nginx 502 apos rebuild:
```bash
sudo docker compose -f docker-compose.oci.yml up -d --no-deps --force-recreate nginx
```

- Backend sem health:
```bash
sudo docker logs --tail=200 gmp-backend
```

## 8. DNS / Rede (checklist)
- Criar/ajustar A record `gestaodeprojetoshml.oais.cloud` -> IP publico/NAT da VM `10.10.11.93`
- Liberar portas 80 e 443 no Security List / NSG da OCI
- Se usar proxy/borda externa, garantir encaminhamento para a VM correta
