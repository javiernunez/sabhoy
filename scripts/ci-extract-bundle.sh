#!/usr/bin/env bash
# Extrae deploy.tgz en el VPS (lo invoca deploy-main.yml por SSH).
set -euo pipefail

DEPLOY_PATH="${1:?DEPLOY_PATH}"
BUNDLE="${2:?BUNDLE}"
SERVICE_NAME="${3:?SERVICE_NAME}"

cd "$DEPLOY_PATH"
_unit="${SERVICE_NAME}.service"

systemctl stop "$_unit" 2>/dev/null || sudo -n systemctl stop "$_unit" 2>/dev/null || true
sleep 2

if sudo -n true 2>/dev/null; then
  sudo -n rm -rf "${DEPLOY_PATH}/.next"
else
  rm -rf "${DEPLOY_PATH}/.next" || {
    echo "ERROR: no se pudo borrar ${DEPLOY_PATH}/.next (¿archivos de root?). En el VPS:" >&2
    echo "  sudo systemctl stop ${_unit}; sudo chown -R $(whoami):$(id -gn) ${DEPLOY_PATH}" >&2
    exit 1
  }
fi

tar -xzf "$BUNDLE" -C "$DEPLOY_PATH"
rm -f "$BUNDLE"

if sudo -n true 2>/dev/null; then
  sudo -n chown -R "$(whoami):$(id -gn)" "${DEPLOY_PATH}/.next" 2>/dev/null || true
fi
