#!/usr/bin/env bash
# Deploy en el servidor: git ya debe haber dejado este repo en la revisión deseada.
#
# Variables opcionales:
# - DEPLOY_PATH
# - SERVICE_NAME
# - SKIP_NPM_IF_LOCK_UNCHANGED=1 (por defecto 1)
# - STOP_BEFORE_BUILD=0 (por defecto 0; poner 1 en VPS muy justo de RAM/CPU)
# - SKIP_NPM_CI=0 / SKIP_BUILD=0
#   Si compilas en GitHub Actions (ubuntu, misma arquitectura que el VPS) y subes un tarball
#   con .next + node_modules + resto de dependencias, puedes poner SKIP_NPM_CI=1 SKIP_BUILD=1
#   y limitar el servidor a: prisma migrate + restart. No subas .next desde macOS/Windows.
# - NEXT_PUBLIC_* deben coincidir entre el entorno de build y producción (mejor: build en CI con los mismos secrets).
set -euxo pipefail

DEPLOY_PATH="${DEPLOY_PATH:-/opt/sabhoy.es}"
SERVICE_NAME="${SERVICE_NAME:-sabhoy}"
SKIP_NPM_IF_LOCK_UNCHANGED="${SKIP_NPM_IF_LOCK_UNCHANGED:-1}"
STOP_BEFORE_BUILD="${STOP_BEFORE_BUILD:-0}"
SKIP_NPM_CI="${SKIP_NPM_CI:-0}"
SKIP_BUILD="${SKIP_BUILD:-0}"
STAMP_FILE=".deploy-npm-lock-stamp"

cd "$DEPLOY_PATH"

# Cargar .env (build de Next/Prisma, docker compose, etc.)
set -a
test -f .env && . ./.env || true
set +a

# Defaults solo si faltan en .env
export DATABASE_URL="${DATABASE_URL:-postgresql://sabhoy:sabhoy@127.0.0.1:5436/sabhoy}"
export NEXT_PUBLIC_SITE_URL="${NEXT_PUBLIC_SITE_URL:-https://www.sabhoy.es}"
# NextAuth: NEXTAUTH_URL y NEXTAUTH_SECRET en .env (ve .env.example)

# Mismo mapeo que docker-compose: host 127.0.0.1:5436 -> contenedor 5432
if [ -f docker-compose.yml ] && echo "$DATABASE_URL" | grep -qE ':(5434|5435)/'; then
  echo "ERROR: DATABASE_URL usa puerto 5434/5435 (lelianahoy/sermestre). sabhoy.es usa 127.0.0.1:5436 (ver docker-compose.yml y .env)." >&2
  exit 1
fi

if [ -f docker-compose.yml ]; then
  date -u "+[deploy] %Y-%m-%dT%H:%M:%SZ docker compose up + espera pg_isready"
  docker compose up -d
  for i in $(seq 1 90); do
    if docker exec sabhoy-db pg_isready -U "${POSTGRES_USER:-sabhoy}" -d "${POSTGRES_DB:-sabhoy}" 2>/dev/null; then
      break
    fi
    if [ "$i" -ge 90 ]; then
      echo "ERROR: timeout esperando PostgreSQL en el contenedor sabhoy-db" >&2
      exit 1
    fi
    sleep 1
  done
fi

# Por defecto hacemos build con la app arriba para evitar 502 prolongados.
# En máquinas con recursos muy limitados se puede forzar parada previa con
# STOP_BEFORE_BUILD=1.
systemctl_unit() {
  local cmd="$1"
  local unit="${SERVICE_NAME}.service"
  if systemctl "$cmd" "$unit" 2>/dev/null; then
    return 0
  fi
  if command -v sudo >/dev/null 2>&1 && sudo -n systemctl "$cmd" "$unit" 2>/dev/null; then
    return 0
  fi
  return 1
}

default_app_port() {
  case "${SERVICE_NAME}" in
    lelianahoy) echo 3000 ;;
    sabhoy) echo 3003 ;;
    beterahoy) echo 3002 ;;
    *) echo 3000 ;;
  esac
}

DEPLOY_APP_PORT="${DEPLOY_APP_PORT:-$(default_app_port)}"

restart_app_service() {
  date -u "+[deploy] %Y-%m-%dT%H:%M:%SZ restart ${SERVICE_NAME} (puerto ${DEPLOY_APP_PORT})"
  if systemctl_unit reload-or-restart; then
    systemctl_unit is-active && return 0
    echo "WARN: systemctl reload-or-restart ok pero is-active falló" >&2
    return 0
  fi
  date -u "+[deploy] %Y-%m-%dT%H:%M:%SZ systemctl sin permisos; reinicio directo npm (puerto ${DEPLOY_APP_PORT})"
  if command -v fuser >/dev/null 2>&1; then
    fuser -k "${DEPLOY_APP_PORT}/tcp" 2>/dev/null || true
  else
    pkill -f "next start.*-p ${DEPLOY_APP_PORT}" 2>/dev/null || true
  fi
  sleep 2
  nohup npm run start -- -H 127.0.0.1 -p "${DEPLOY_APP_PORT}" >> "${DEPLOY_PATH}/deploy-restart.log" 2>&1 &
  sleep 3
  if ss -tln 2>/dev/null | grep -q ":${DEPLOY_APP_PORT} "; then
    date -u "+[deploy] %Y-%m-%dT%H:%M:%SZ app listening on ${DEPLOY_APP_PORT}"
    return 0
  fi
  echo "ERROR: no se pudo reiniciar en el puerto ${DEPLOY_APP_PORT}. Configura sudoers para systemctl o revisa deploy-restart.log" >&2
  exit 1
}

if [ "$STOP_BEFORE_BUILD" = 1 ]; then
  if systemctl is-active --quiet "${SERVICE_NAME}.service" 2>/dev/null || sudo -n systemctl is-active --quiet "${SERVICE_NAME}.service" 2>/dev/null; then
    date -u "+[deploy] %Y-%m-%dT%H:%M:%SZ systemctl stop (STOP_BEFORE_BUILD=1)"
    systemctl_unit stop || true
  fi
fi

run_npm_ci() {
  date -u "+[deploy] %Y-%m-%dT%H:%M:%SZ npm ci (lockfile o node_modules tocan instalar)…"
  # --prefer-offline: cache en ~/.npm
  # --no-audit --no-fund: menos trabajo
  # --foreground-scripts: scripts de postinstall en serie (menos picos de RAM/CPU)
  # nice: deja a SSH/sistema aire si el host está al límite
  export CI=true
  nice -n 10 npm ci --include=dev --prefer-offline --no-audit --no-fund --foreground-scripts
  if [ -f package-lock.json ]; then
    sha256sum package-lock.json | awk '{print $1}' > "$STAMP_FILE"
  fi
}

if [ "$SKIP_NPM_CI" = 1 ]; then
  date -u "+[deploy] %Y-%m-%dT%H:%M:%SZ omitir npm ci (SKIP_NPM_CI=1)"
elif [ "$SKIP_NPM_IF_LOCK_UNCHANGED" = 1 ] && [ -f package-lock.json ] && [ -d node_modules ] && [ -f "$STAMP_FILE" ]; then
  cur="$(sha256sum package-lock.json | awk '{print $1}')"
  prev="$(cat "$STAMP_FILE" 2>/dev/null || true)"
  if [ -n "$prev" ] && [ "$cur" = "$prev" ]; then
    date -u "+[deploy] %Y-%m-%dT%H:%M:%SZ skip npm ci (package-lock.json sin cambios)…"
  else
    run_npm_ci
  fi
else
  run_npm_ci
fi

date -u "+[deploy] %Y-%m-%dT%H:%M:%SZ prisma migrate"
npm run prisma:deploy

if [ "$SKIP_BUILD" = 1 ]; then
  date -u "+[deploy] %Y-%m-%dT%H:%M:%SZ omitir npm run build (SKIP_BUILD=1)"
  if [ ! -d .next ]; then
    echo "ERROR: SKIP_BUILD=1 pero falta carpeta .next" >&2
    exit 1
  fi
else
  date -u "+[deploy] %Y-%m-%dT%H:%M:%SZ next build"
  nice -n 10 npm run build
fi

restart_app_service
date -u "+[deploy] %Y-%m-%dT%H:%M:%SZ done"
