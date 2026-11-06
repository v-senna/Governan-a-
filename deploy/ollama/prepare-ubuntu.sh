#!/usr/bin/env bash
set -euo pipefail

if [[ ! -r /etc/os-release ]]; then
  echo "Não consegui identificar o sistema operacional." >&2
  exit 1
fi
# shellcheck disable=SC1091
source /etc/os-release
if [[ "${ID:-}" != "ubuntu" ]]; then
  echo "Este script foi preparado para Ubuntu Server. Sistema detectado: ${PRETTY_NAME:-desconhecido}." >&2
  exit 1
fi
if ! command -v systemctl >/dev/null 2>&1; then
  echo "systemd/systemctl não está disponível neste ambiente." >&2
  exit 1
fi
if ! command -v curl >/dev/null 2>&1; then
  echo "Instale curl antes de continuar: sudo apt update && sudo apt install -y curl" >&2
  exit 1
fi

printf 'Sistema: %s\n' "${PRETTY_NAME:-Ubuntu}"
printf 'RAM disponível:\n'
free -h
printf 'Espaço disponível:\n'
df -h /
echo "Confirme memória e espaço livre antes de baixar o modelo (~2 GB para llama3.2 padrão)."
read -r -p "Instalar Ollama e baixar llama3.2? (s/N) " confirm
if [[ ! "$confirm" =~ ^[sS]$ ]]; then
  echo "Cancelado sem alterações."
  exit 0
fi

curl -fsSL https://ollama.com/install.sh | sh

# Ollama fica restrito ao loopback. Não publique a porta 11434 na internet.
sudo install -d -m 0755 /etc/systemd/system/ollama.service.d
printf '[Service]\nEnvironment="OLLAMA_HOST=127.0.0.1:11434"\n' | sudo tee /etc/systemd/system/ollama.service.d/override.conf >/dev/null
sudo systemctl daemon-reload
sudo systemctl enable --now ollama
sudo systemctl restart ollama

for attempt in {1..30}; do
  if curl -fsS http://127.0.0.1:11434/api/tags >/dev/null; then
    break
  fi
  sleep 2
done
if ! curl -fsS http://127.0.0.1:11434/api/tags >/dev/null; then
  echo "O serviço Ollama não respondeu em 127.0.0.1:11434." >&2
  sudo systemctl status ollama --no-pager || true
  exit 1
fi

ollama pull llama3.2
printf '\nOllama instalado e API respondendo localmente. Modelos disponíveis:\n'
curl -fsS http://127.0.0.1:11434/api/tags
printf '\n\nPróximo passo: execute o teste de chat descrito em deploy/ollama/README.md.\n'
