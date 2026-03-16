# OCI CLI no Linux (bash) - Setup para Deploy

Este guia prepara o OCI CLI em Linux e valida o acesso para publicar o projeto na Oracle Cloud.

## 1. Instalação recomendada da Oracle

Use o script oficial (a automação abaixo já faz isso):

```bash
bash -c "$(curl -L https://raw.githubusercontent.com/oracle/oci-cli/master/scripts/install/install.sh)" -- --accept-all-defaults
```

## 2. Estrutura esperada

```text
~/.oci/
~/.oci/config
~/.oci/oci_api_key.pem
~/.oci/oci_api_key_public.pem
```

## 3. Configuração manual esperada

```ini
[DEFAULT]
user=ocid1.user.oc1..aaaaaaaa34wiezitzgjz2pm6jhay77ldd7bpgfipytd3y5zzbqjbn3vnexpa
fingerprint=5b:9c:78:7b:bc:d6:5d:49:f5:53:70:6a:da:ef:2e:1c
key_file=/home/<seu-usuario>/.oci/oci_api_key.pem
tenancy=ocid1.tenancy.oc1..aaaaaaaasruaiaemo24jjsnz5vwetlgq22uc7n36n6bxhmw7l4coz4bh33kq
region=sa-saopaulo-1
```

## 4. Script automatizado do projeto

Arquivo:

```text
deploy/oci/setup_oci_cli_linux.sh
```

Executar com defaults (já preenchidos para este ambiente):

```bash
chmod +x deploy/oci/setup_oci_cli_linux.sh
./deploy/oci/setup_oci_cli_linux.sh
```

Executar com parâmetros explícitos:

```bash
./deploy/oci/setup_oci_cli_linux.sh \
  --user-ocid "ocid1.user.oc1..aaaaaaaa34wiezitzgjz2pm6jhay77ldd7bpgfipytd3y5zzbqjbn3vnexpa" \
  --fingerprint "5b:9c:78:7b:bc:d6:5d:49:f5:53:70:6a:da:ef:2e:1c" \
  --tenancy-ocid "ocid1.tenancy.oc1..aaaaaaaasruaiaemo24jjsnz5vwetlgq22uc7n36n6bxhmw7l4coz4bh33kq" \
  --region "sa-saopaulo-1" \
  --key-file "$HOME/.oci/oci_api_key.pem"
```

## 5. Chave API e cadastro no Console OCI

Se precisar gerar chave nova:

```bash
openssl genrsa -out ~/.oci/oci_api_key.pem 2048
chmod 600 ~/.oci/oci_api_key.pem
openssl rsa -pubout -in ~/.oci/oci_api_key.pem -out ~/.oci/oci_api_key_public.pem
```

Registrar a pública no Console OCI:

```text
Identity & Security -> Users -> <seu usuário> -> API Keys -> Add API Key
```

Cole o conteúdo de `~/.oci/oci_api_key_public.pem`.

## 6. Testes de validação

```bash
oci iam region list --output table
oci os ns get --output table
```

## 7. Troubleshooting rápido

- Permissão da chave privada:

```bash
chmod 600 ~/.oci/oci_api_key.pem
chmod 600 ~/.oci/config
chmod 700 ~/.oci
```

- Fingerprint não bate:

```bash
openssl rsa -pubout -outform DER -in ~/.oci/oci_api_key.pem | openssl md5 -c
```

Ajuste no `~/.oci/config` ou recadastre a chave pública no Console.

- Region inválida:

```bash
oci iam region list --output table
```

Confirme `region=sa-saopaulo-1` no profile.

## 8. Próximo passo: deploy da aplicação

Após OCI CLI validado no Linux:

```bash
bash deploy/oci/deploy.sh --env-file .env --compose-file docker-compose.prod.yml
```

Se for primeiro provisionamento de VM Linux:

```bash
bash deploy/oci/setup_vm.sh
bash deploy/oci/setup_nginx_ssl.sh --app-domain app.seudominio.com --api-domain api.seudominio.com --email voce@seudominio.com
```
