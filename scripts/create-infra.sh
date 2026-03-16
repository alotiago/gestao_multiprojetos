#!/usr/bin/env bash
# ==============================================================
# create-infra.sh — Gestor Multiprojetos
# Provisiona infraestrutura OCI Free Tier completa:
#   VCN → Internet Gateway → Route Table → Security List
#   → Subnet pública → VM.Standard.E2.1.Micro (Ubuntu 22.04)
#
# Pré-requisitos:
#   - OCI CLI configurado (~/.oci/config)
#   - Variável OCI_COMPARTMENT_ID definida (ou edite abaixo)
#   - Chave SSH pública disponível (padrão: ~/.ssh/id_rsa.pub)
#
# Uso (Git Bash no Windows):
#   export OCI_COMPARTMENT_ID=ocid1.tenancy.oc1..xxx
#   bash scripts/create-infra.sh
#
# Resultado: arquivo infra-ids.env com todos os IDs gerados
# ==============================================================
set -euo pipefail

# ── Cores ────────────────────────────────────────────────────
RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'
CYAN='\033[0;36m'; BOLD='\033[1m'; NC='\033[0m'
log()  { echo -e "${GREEN}[$(date '+%H:%M:%S')]${NC} $*"; }
info() { echo -e "${CYAN}[INFO]${NC} $*"; }
warn() { echo -e "${YELLOW}[WARN]${NC} $*"; }
err()  { echo -e "${RED}[ERRO]${NC} $*" >&2; exit 1; }
step() { echo -e "\n${BOLD}${CYAN}══ $* ══${NC}"; }

# ── Configuração — ajuste se necessário ──────────────────────
COMPARTMENT_ID="${OCI_COMPARTMENT_ID:-ocid1.tenancy.oc1..aaaaaaaasruaiaemo24jjsnz5vwetlgq22uc7n36n6bxhmw7l4coz4bh33kq}"
REGION="${OCI_REGION:-sa-saopaulo-1}"
VM_SHAPE="VM.Standard.E2.1.Micro"          # Always Free AMD
VM_DISPLAY_NAME="gestor-multiprojetos"
VCN_DISPLAY_NAME="gestor-vcn"
VCN_CIDR="10.0.0.0/16"
SUBNET_CIDR="10.0.1.0/24"
SSH_PUBLIC_KEY_PATH="${SSH_PUBLIC_KEY_PATH:-$HOME/.ssh/id_rsa.pub}"
BOOT_VOLUME_GB=50                           # 50 GB incluído no Free Tier
OUTPUT_FILE="infra-ids.env"

# ── Verificações iniciais ─────────────────────────────────────
echo -e "${BOLD}${CYAN}"
echo "╔═══════════════════════════════════════════════╗"
echo "║   Gestor Multiprojetos — OCI Free Tier Setup  ║"
echo "╚═══════════════════════════════════════════════╝${NC}"
echo ""

command -v oci  >/dev/null 2>&1 || err "OCI CLI não encontrado. Instale em: https://docs.oracle.com/iaas/Content/API/SDKDocs/cliinstall.htm"
command -v python3 >/dev/null 2>&1 || err "Python3 não encontrado (necessário para parsear JSON do OCI CLI)."

[[ -z "$COMPARTMENT_ID" ]] && err "COMPARTMENT_ID não definido. Execute: export OCI_COMPARTMENT_ID=ocid1.tenancy.oc1..xxx"
[[ ! -f "$SSH_PUBLIC_KEY_PATH" ]] && err "Chave SSH pública não encontrada: $SSH_PUBLIC_KEY_PATH\nGere uma com: ssh-keygen -t rsa -b 4096 -f ~/.ssh/id_rsa"

info "Compartment : ${COMPARTMENT_ID:0:35}..."
info "Região      : $REGION"
info "Shape       : $VM_SHAPE"
info "Chave SSH   : $SSH_PUBLIC_KEY_PATH"
echo ""

# Teste de autenticação OCI
log "Verificando autenticação OCI..."
if ! oci iam region list --output json >/dev/null 2>&1; then
  err "Falha na autenticação OCI. Verifique ~/.oci/config e certifique-se de que a chave pública está registrada no OCI Console."
fi
log "Autenticação OCI OK."

# ── Helper: parsear JSON ──────────────────────────────────────
json_get() { python3 -c "import sys,json; d=json.load(sys.stdin); print($1)" 2>/dev/null; }

# ── 1. VCN ────────────────────────────────────────────────────
step "1/9 — Criando Virtual Cloud Network (VCN)"

# Reusar VCN existente se já criada
EXISTING_VCN=$(oci network vcn list \
  --compartment-id "$COMPARTMENT_ID" \
  --display-name "$VCN_DISPLAY_NAME" \
  --region "$REGION" \
  --output json 2>/dev/null \
  | python3 -c "
import sys, json
data = json.load(sys.stdin)['data']
active = [v for v in data if v['lifecycle-state'] == 'AVAILABLE']
print(active[0]['id'] if active else '')
")

if [[ -n "$EXISTING_VCN" ]]; then
  VCN_ID="$EXISTING_VCN"
  warn "VCN '$VCN_DISPLAY_NAME' já existe. Reusando: $VCN_ID"
else
  VCN_JSON=$(oci network vcn create \
    --compartment-id "$COMPARTMENT_ID" \
    --display-name "$VCN_DISPLAY_NAME" \
    --cidr-block "$VCN_CIDR" \
    --dns-label "gestorvcn" \
    --region "$REGION" \
    --wait-for-state AVAILABLE \
    --output json 2>&1) || err "Falha ao criar VCN: $VCN_JSON"
  VCN_ID=$(echo "$VCN_JSON" | python3 -c "import sys,json; print(json.load(sys.stdin)['data']['id'])")
  log "VCN criada: $VCN_ID"
fi

# ── 2. Internet Gateway ─────────────────────────────────────
step "2/9 — Criando Internet Gateway"

EXISTING_IGW=$(oci network internet-gateway list \
  --compartment-id "$COMPARTMENT_ID" \
  --vcn-id "$VCN_ID" \
  --region "$REGION" \
  --output json 2>/dev/null \
  | python3 -c "
import sys, json
data = json.load(sys.stdin)['data']
active = [g for g in data if g['lifecycle-state'] == 'AVAILABLE']
print(active[0]['id'] if active else '')
")

if [[ -n "$EXISTING_IGW" ]]; then
  IGW_ID="$EXISTING_IGW"
  warn "Internet Gateway já existe. Reusando: $IGW_ID"
else
  IGW_JSON=$(oci network internet-gateway create \
    --compartment-id "$COMPARTMENT_ID" \
    --vcn-id "$VCN_ID" \
    --display-name "gestor-igw" \
    --is-enabled true \
    --region "$REGION" \
    --wait-for-state AVAILABLE \
    --output json 2>&1) || err "Falha ao criar Internet Gateway: $IGW_JSON"
  IGW_ID=$(echo "$IGW_JSON" | python3 -c "import sys,json; print(json.load(sys.stdin)['data']['id'])")
  log "Internet Gateway: $IGW_ID"
fi

# ── 3. Route Table ───────────────────────────────────────────
step "3/9 — Configurando Route Table"

ROUTE_RULES=$(python3 -c "
import json
rules = [{
    'destination': '0.0.0.0/0',
    'destinationType': 'CIDR_BLOCK',
    'networkEntityId': '$IGW_ID'
}]
print(json.dumps(rules))
")

EXISTING_RT=$(oci network route-table list \
  --compartment-id "$COMPARTMENT_ID" \
  --vcn-id "$VCN_ID" \
  --display-name "gestor-rt" \
  --region "$REGION" \
  --output json 2>/dev/null \
  | python3 -c "
import sys, json
data = json.load(sys.stdin)['data']
active = [r for r in data if r['lifecycle-state'] == 'AVAILABLE']
print(active[0]['id'] if active else '')
")

if [[ -n "$EXISTING_RT" ]]; then
  RT_ID="$EXISTING_RT"
  warn "Route Table já existe. Reusando: $RT_ID"
else
  RT_JSON=$(oci network route-table create \
    --compartment-id "$COMPARTMENT_ID" \
    --vcn-id "$VCN_ID" \
    --display-name "gestor-rt" \
    --route-rules "$ROUTE_RULES" \
    --region "$REGION" \
    --wait-for-state AVAILABLE \
    --output json 2>&1) || err "Falha ao criar Route Table: $RT_JSON"
  RT_ID=$(echo "$RT_JSON" | python3 -c "import sys,json; print(json.load(sys.stdin)['data']['id'])")
  log "Route Table: $RT_ID"
fi

# ── 4. Security List ─────────────────────────────────────────
step "4/9 — Criando Security List (portas 22, 80, 443, 3000-3001)"

INGRESS_RULES=$(python3 -c "
import json
rules = [
    # SSH
    {'source': '0.0.0.0/0', 'protocol': '6', 'isStateless': False,
     'tcpOptions': {'destinationPortRange': {'min': 22, 'max': 22}}},
    # HTTP
    {'source': '0.0.0.0/0', 'protocol': '6', 'isStateless': False,
     'tcpOptions': {'destinationPortRange': {'min': 80, 'max': 80}}},
    # HTTPS
    {'source': '0.0.0.0/0', 'protocol': '6', 'isStateless': False,
     'tcpOptions': {'destinationPortRange': {'min': 443, 'max': 443}}},
    # Frontend Next.js
    {'source': '0.0.0.0/0', 'protocol': '6', 'isStateless': False,
     'tcpOptions': {'destinationPortRange': {'min': 3000, 'max': 3000}}},
    # Backend NestJS
    {'source': '0.0.0.0/0', 'protocol': '6', 'isStateless': False,
     'tcpOptions': {'destinationPortRange': {'min': 3001, 'max': 3001}}},
    # ICMP path MTU
    {'source': '0.0.0.0/0', 'protocol': '1', 'isStateless': False,
     'icmpOptions': {'type': 3, 'code': 4}},
    # ICMP interno
    {'source': '10.0.0.0/16', 'protocol': '1', 'isStateless': False,
     'icmpOptions': {'type': 3}}
]
print(json.dumps(rules))
")

EGRESS_RULES=$(python3 -c "
import json
rules = [{'destination': '0.0.0.0/0', 'protocol': 'all', 'isStateless': False}]
print(json.dumps(rules))
")

EXISTING_SL=$(oci network security-list list \
  --compartment-id "$COMPARTMENT_ID" \
  --vcn-id "$VCN_ID" \
  --display-name "gestor-sl" \
  --region "$REGION" \
  --output json 2>/dev/null \
  | python3 -c "
import sys, json
data = json.load(sys.stdin)['data']
active = [s for s in data if s['lifecycle-state'] == 'AVAILABLE']
print(active[0]['id'] if active else '')
")

if [[ -n "$EXISTING_SL" ]]; then
  SL_ID="$EXISTING_SL"
  warn "Security List já existe. Reusando: $SL_ID"
  # Atualizar regras para garantir que as portas corretas estejam abertas
  oci network security-list update \
    --security-list-id "$SL_ID" \
    --ingress-security-rules "$INGRESS_RULES" \
    --egress-security-rules "$EGRESS_RULES" \
    --region "$REGION" \
    --force \
    --output json >/dev/null 2>&1
  log "Regras da Security List atualizadas."
else
  SL_JSON=$(oci network security-list create \
    --compartment-id "$COMPARTMENT_ID" \
    --vcn-id "$VCN_ID" \
    --display-name "gestor-sl" \
    --ingress-security-rules "$INGRESS_RULES" \
    --egress-security-rules "$EGRESS_RULES" \
    --region "$REGION" \
    --wait-for-state AVAILABLE \
    --output json 2>&1) || err "Falha ao criar Security List: $SL_JSON"
  SL_ID=$(echo "$SL_JSON" | python3 -c "import sys,json; print(json.load(sys.stdin)['data']['id'])")
  log "Security List: $SL_ID"
fi

# ── 5. Subnet Pública ────────────────────────────────────────
step "5/9 — Criando Subnet pública"

EXISTING_SUBNET=$(oci network subnet list \
  --compartment-id "$COMPARTMENT_ID" \
  --vcn-id "$VCN_ID" \
  --display-name "gestor-subnet-pub" \
  --region "$REGION" \
  --output json 2>/dev/null \
  | python3 -c "
import sys, json
data = json.load(sys.stdin)['data']
active = [s for s in data if s['lifecycle-state'] == 'AVAILABLE']
print(active[0]['id'] if active else '')
")

if [[ -n "$EXISTING_SUBNET" ]]; then
  SUBNET_ID="$EXISTING_SUBNET"
  warn "Subnet já existe. Reusando: $SUBNET_ID"
else
  SL_IDS=$(python3 -c "import json; print(json.dumps(['$SL_ID']))")
  SUBNET_JSON=$(oci network subnet create \
    --compartment-id "$COMPARTMENT_ID" \
    --vcn-id "$VCN_ID" \
    --display-name "gestor-subnet-pub" \
    --cidr-block "$SUBNET_CIDR" \
    --dns-label "gestorpub" \
    --route-table-id "$RT_ID" \
    --security-list-ids "$SL_IDS" \
    --prohibit-public-ip-on-vnic false \
    --region "$REGION" \
    --wait-for-state AVAILABLE \
    --output json 2>&1) || err "Falha ao criar Subnet: $SUBNET_JSON"
  SUBNET_ID=$(echo "$SUBNET_JSON" | python3 -c "import sys,json; print(json.load(sys.stdin)['data']['id'])")
  log "Subnet: $SUBNET_ID"
fi

# ── 6. Imagem Ubuntu 22.04 ────────────────────────────────────
step "6/9 — Buscando imagem Ubuntu 22.04 (compatível com E2.1.Micro)"

IMAGE_ID=$(oci compute image list \
  --compartment-id "$COMPARTMENT_ID" \
  --operating-system "Canonical Ubuntu" \
  --operating-system-version "22.04" \
  --shape "$VM_SHAPE" \
  --sort-by TIMECREATED \
  --sort-order DESC \
  --region "$REGION" \
  --output json 2>/dev/null \
  | python3 -c "
import sys, json
imgs = json.load(sys.stdin)['data']
# Filtrar imagens oficiais (não marketplace)
official = [i for i in imgs if 'Canonical' in i.get('operating-system','')]
if not official:
    sys.exit(1)
print(official[0]['id'])
") || err "Imagem Ubuntu 22.04 não encontrada para o shape $VM_SHAPE na região $REGION."
log "Imagem Ubuntu 22.04: $IMAGE_ID"

# ── 7. Availability Domain ───────────────────────────────────
step "7/9 — Verificando Availability Domain"

AD=$(oci iam availability-domain list \
  --compartment-id "$COMPARTMENT_ID" \
  --region "$REGION" \
  --output json 2>/dev/null \
  | python3 -c "import sys,json; print(json.load(sys.stdin)['data'][0]['name'])")
log "Availability Domain: $AD"

# ── 8. Compute Instance ──────────────────────────────────────
step "8/9 — Criando instância VM.Standard.E2.1.Micro"
log "Aguarde — a VM leva 2-5 minutos para ficar no estado RUNNING..."

# Verificar se instância já existe
EXISTING_INSTANCE=$(oci compute instance list \
  --compartment-id "$COMPARTMENT_ID" \
  --display-name "$VM_DISPLAY_NAME" \
  --region "$REGION" \
  --output json 2>/dev/null \
  | python3 -c "
import sys, json
data = json.load(sys.stdin)['data']
active = [i for i in data if i['lifecycle-state'] not in ('TERMINATED','TERMINATING')]
print(active[0]['id'] if active else '')
")

if [[ -n "$EXISTING_INSTANCE" ]]; then
  INSTANCE_ID="$EXISTING_INSTANCE"
  warn "Instância '$VM_DISPLAY_NAME' já existe. Reusando: $INSTANCE_ID"
else
  SSH_KEY_CONTENT=$(cat "$SSH_PUBLIC_KEY_PATH")
  # Escapa aspas para JSON
  SSH_KEY_ESCAPED="${SSH_KEY_CONTENT//\"/\\\"}"
  METADATA_JSON="{\"ssh_authorized_keys\":\"${SSH_KEY_ESCAPED}\"}"

  INSTANCE_JSON=$(oci compute instance launch \
    --compartment-id "$COMPARTMENT_ID" \
    --availability-domain "$AD" \
    --shape "$VM_SHAPE" \
    --display-name "$VM_DISPLAY_NAME" \
    --image-id "$IMAGE_ID" \
    --subnet-id "$SUBNET_ID" \
    --assign-public-ip true \
    --metadata "$METADATA_JSON" \
    --boot-volume-size-in-gbs "$BOOT_VOLUME_GB" \
    --region "$REGION" \
    --wait-for-state RUNNING \
    --max-wait-seconds 600 \
    --output json 2>&1) || err "Falha ao criar instância: $INSTANCE_JSON"
  INSTANCE_ID=$(echo "$INSTANCE_JSON" | python3 -c "import sys,json; print(json.load(sys.stdin)['data']['id'])")
  log "Instância criada: $INSTANCE_ID"
fi

# ── 9. Obter IP Público ──────────────────────────────────────
step "9/9 — Obtendo IP Público da VM"

# Aguardar VNICs ficarem disponíveis
sleep 10
PUBLIC_IP=$(oci compute instance list-vnics \
  --instance-id "$INSTANCE_ID" \
  --region "$REGION" \
  --output json 2>/dev/null \
  | python3 -c "
import sys, json
vnics = json.load(sys.stdin)['data']
ips = [v.get('public-ip','') for v in vnics if v.get('public-ip')]
print(ips[0] if ips else 'N/A')
")
log "IP Público: $PUBLIC_IP"

# ── Salvar IDs ────────────────────────────────────────────────
cat > "$OUTPUT_FILE" <<ENVEOF
# Gerado por create-infra.sh em $(date '+%Y-%m-%d %H:%M:%S')
COMPARTMENT_ID=$COMPARTMENT_ID
REGION=$REGION
VCN_ID=$VCN_ID
IGW_ID=$IGW_ID
RT_ID=$RT_ID
SECURITY_LIST_ID=$SL_ID
SUBNET_ID=$SUBNET_ID
IMAGE_ID=$IMAGE_ID
AVAILABILITY_DOMAIN=$AD
INSTANCE_ID=$INSTANCE_ID
PUBLIC_IP=$PUBLIC_IP
VM_SHAPE=$VM_SHAPE
ENVEOF

# ── Resumo Final ──────────────────────────────────────────────
echo ""
echo -e "${BOLD}${GREEN}"
echo "╔════════════════════════════════════════════════════════╗"
echo "║           INFRAESTRUTURA CRIADA COM SUCESSO!           ║"
echo "╠════════════════════════════════════════════════════════╣"
printf "║  IP Público : %-41s ║\n" "$PUBLIC_IP"
printf "║  VM Shape   : %-41s ║\n" "$VM_SHAPE (Always Free)"
printf "║  IDs salvos : %-41s ║\n" "$OUTPUT_FILE"
echo "╠════════════════════════════════════════════════════════╣"
echo "║  PRÓXIMO PASSO:                                        ║"
echo "║  1. Aguarde 2 min para SSH estar disponível            ║"
echo "║  2. Execute:                                           ║"
echo "║     export VM_IP=$PUBLIC_IP                            ║"
echo "║     export REPO_URL=git@github.com:SEU/REPO.git        ║"
echo "║     bash scripts/deploy-app.sh                         ║"
echo "╚════════════════════════════════════════════════════════╝"
echo -e "${NC}"
echo ""
echo "  IMPORTANTE — Abrir porta no firewall da VM (iptables):"
echo "  O Ubuntu na OCI tem iptables ativo. O deploy-app.sh"
echo "  configura isso automaticamente."
echo ""
echo "  Verificar SSH manualmente:"
echo "    ssh ubuntu@$PUBLIC_IP -i ~/.ssh/id_rsa"
