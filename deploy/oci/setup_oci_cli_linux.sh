#!/usr/bin/env bash
set -euo pipefail

# OCI CLI setup for Linux (bash)
# This script installs OCI CLI (official method), creates ~/.oci structure,
# configures ~/.oci/config, and validates access with basic OCI commands.

DEFAULT_USER_OCID="ocid1.user.oc1..aaaaaaaa34wiezitzgjz2pm6jhay77ldd7bpgfipytd3y5zzbqjbn3vnexpa"
DEFAULT_FINGERPRINT="5b:9c:78:7b:bc:d6:5d:49:f5:53:70:6a:da:ef:2e:1c"
DEFAULT_TENANCY_OCID="ocid1.tenancy.oc1..aaaaaaaasruaiaemo24jjsnz5vwetlgq22uc7n36n6bxhmw7l4coz4bh33kq"
DEFAULT_REGION="sa-saopaulo-1"
DEFAULT_PROFILE="DEFAULT"

USER_OCID="${OCI_USER_OCID:-$DEFAULT_USER_OCID}"
FINGERPRINT="${OCI_FINGERPRINT:-$DEFAULT_FINGERPRINT}"
TENANCY_OCID="${OCI_TENANCY_OCID:-$DEFAULT_TENANCY_OCID}"
REGION="${OCI_REGION:-$DEFAULT_REGION}"
PROFILE="$DEFAULT_PROFILE"
KEY_FILE="${OCI_KEY_FILE:-$HOME/.oci/oci_api_key.pem}"
GENERATE_KEY="true"

while [[ $# -gt 0 ]]; do
  case "$1" in
    --user-ocid)
      USER_OCID="$2"
      shift 2
      ;;
    --fingerprint)
      FINGERPRINT="$2"
      shift 2
      ;;
    --tenancy-ocid)
      TENANCY_OCID="$2"
      shift 2
      ;;
    --region)
      REGION="$2"
      shift 2
      ;;
    --key-file)
      KEY_FILE="$2"
      shift 2
      ;;
    --profile)
      PROFILE="$2"
      shift 2
      ;;
    --no-generate-key)
      GENERATE_KEY="false"
      shift
      ;;
    *)
      echo "Parâmetro inválido: $1"
      echo "Uso: $0 [--user-ocid OCID] [--fingerprint FP] [--tenancy-ocid OCID] [--region REGIAO] [--key-file CAMINHO] [--profile NOME] [--no-generate-key]"
      exit 1
      ;;
  esac
done

echo "[1/7] Instalando dependências base..."
if command -v apt-get >/dev/null 2>&1; then
  sudo apt-get update
  sudo apt-get install -y python3 python3-venv python3-pip curl unzip openssl
elif command -v dnf >/dev/null 2>&1; then
  sudo dnf install -y python3 python3-pip curl unzip openssl
elif command -v yum >/dev/null 2>&1; then
  sudo yum install -y python3 python3-pip curl unzip openssl
else
  echo "Gerenciador de pacotes não suportado automaticamente. Instale python3/curl/unzip/openssl manualmente."
fi

echo "[2/7] Instalando OCI CLI (método oficial da Oracle)..."
if ! command -v oci >/dev/null 2>&1; then
  bash -c "$(curl -L https://raw.githubusercontent.com/oracle/oci-cli/master/scripts/install/install.sh)" -- --accept-all-defaults
fi

# Ensure oci command is in PATH for current shell session
if [[ -d "$HOME/bin" ]]; then
  export PATH="$HOME/bin:$PATH"
fi

if ! command -v oci >/dev/null 2>&1; then
  echo "OCI CLI não encontrado no PATH após instalação. Abra um novo terminal e execute novamente."
  exit 1
fi

echo "[3/7] Preparando diretório ~/.oci..."
mkdir -p "$HOME/.oci"
chmod 700 "$HOME/.oci"

echo "[4/7] Preparando chave API RSA..."
if [[ "$GENERATE_KEY" == "true" && ! -f "$KEY_FILE" ]]; then
  openssl genrsa -out "$KEY_FILE" 2048
fi

if [[ ! -f "$KEY_FILE" ]]; then
  echo "Chave privada não encontrada: $KEY_FILE"
  echo "Forneça uma chave existente com --key-file ou remova --no-generate-key"
  exit 1
fi

chmod 600 "$KEY_FILE"
openssl rsa -pubout -in "$KEY_FILE" -out "$HOME/.oci/oci_api_key_public.pem" >/dev/null 2>&1

LOCAL_FP="$(openssl rsa -pubout -outform DER -in "$KEY_FILE" | openssl md5 -c | awk '{print $2}')"

echo "[5/7] Gravando ~/.oci/config..."
cat > "$HOME/.oci/config" <<CFG
[$PROFILE]
user=$USER_OCID
fingerprint=$FINGERPRINT
key_file=$KEY_FILE
tenancy=$TENANCY_OCID
region=$REGION
CFG
chmod 600 "$HOME/.oci/config"

echo "[6/7] Validando versão e perfil..."
oci --version

echo "Fingerprint local da chave: $LOCAL_FP"
echo "Fingerprint configurada no profile: $FINGERPRINT"
if [[ "$LOCAL_FP" != "$FINGERPRINT" ]]; then
  echo "AVISO: fingerprint da chave local difere da configurada."
  echo "Registre o conteúdo de ~/.oci/oci_api_key_public.pem no Console OCI e/ou ajuste fingerprint no config."
fi

echo "[7/7] Testes básicos de acesso OCI..."
set +e
oci iam region list --profile "$PROFILE" --output table
REGION_EXIT=$?
oci os ns get --profile "$PROFILE" --output table
NS_EXIT=$?
set -e

echo
echo "Concluído."
echo "Arquivo de config: $HOME/.oci/config"
echo "Chave privada: $KEY_FILE"
echo "Chave pública: $HOME/.oci/oci_api_key_public.pem"
echo
echo "Próximo passo no projeto:"
echo "  cd /opt/gestor_multiprojetos && bash deploy/oci/deploy.sh --env-file .env --compose-file docker-compose.prod.yml"

if [[ $REGION_EXIT -ne 0 || $NS_EXIT -ne 0 ]]; then
  echo
  echo "Validação OCI retornou erros. Revise fingerprint, region e API key no Console OCI."
  exit 2
fi
