#!/usr/bin/env bash
# Deploy en el servidor: el artefacto de CI (deploy.tgz) debe haber extraído scripts/, prisma/, .next, etc.
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

rm -rf .next/cache

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

DB_CONTAINER="sabhoy-db"

if [ -f docker-compose.yml ]; then
  date -u "+[deploy] %Y-%m-%dT%H:%M:%SZ postgres (${DB_CONTAINER}) + espera pg_isready"
  if docker container inspect "$DB_CONTAINER" >/dev/null 2>&1; then
    date -u "+[deploy] ${DB_CONTAINER} ya existe; arrancar si estaba parado"
    docker start "$DB_CONTAINER" >/dev/null 2>&1 || true
  else
    docker compose up -d
  fi
  for i in $(seq 1 90); do
    if docker exec "$DB_CONTAINER" pg_isready -U "${POSTGRES_USER:-sabhoy}" -d "${POSTGRES_DB:-sabhoy}" 2>/dev/null; then
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

# VPS: 3000 lelianahoy | 3001 sermestre | 3002 beterahoy | 3003 sabhoy
DEPLOY_APP_PORT="${DEPLOY_APP_PORT:-3003}"

port_is_listening() {
  ss -tln 2>/dev/null | grep -q ":${DEPLOY_APP_PORT} "
}

free_deploy_app_port() {
  systemctl_unit stop || true
  pkill -f "${DEPLOY_PATH}.*next" 2>/dev/null || true
  pkill -f "next start.*-p ${DEPLOY_APP_PORT}" 2>/dev/null || true
  pkill -f "npm run start.*-p ${DEPLOY_APP_PORT}" 2>/dev/null || true
  if command -v fuser >/dev/null 2>&1; then
    fuser -k "${DEPLOY_APP_PORT}/tcp" 2>/dev/null \
      || sudo -n fuser -k "${DEPLOY_APP_PORT}/tcp" 2>/dev/null \
      || true
  fi
  sleep 2
}

start_app_via_nohup() {
  date -u "+[deploy] %Y-%m-%dT%H:%M:%SZ systemctl indisponible; npm en segundo plano (puerto ${DEPLOY_APP_PORT})"
  nohup npm run start -- -H 127.0.0.1 -p "${DEPLOY_APP_PORT}" >> "${DEPLOY_PATH}/deploy-restart.log" 2>&1 &
  sleep 3
}

restart_app_service() {
  date -u "+[deploy] %Y-%m-%dT%H:%M:%SZ restart ${SERVICE_NAME} (puerto ${DEPLOY_APP_PORT})"
  free_deploy_app_port

  if systemctl_unit restart && sleep 5 && systemctl_unit is-active && port_is_listening; then
    date -u "+[deploy] %Y-%m-%dT%H:%M:%SZ systemd activo en ${DEPLOY_APP_PORT}"
    return 0
  fi

  echo "WARN: systemd no escucha en ${DEPLOY_APP_PORT}; reintento tras liberar puerto" >&2
  free_deploy_app_port
  if systemctl_unit restart && sleep 5 && systemctl_unit is-active && port_is_listening; then
    date -u "+[deploy] %Y-%m-%dT%H:%M:%SZ systemd activo tras restart en ${DEPLOY_APP_PORT}"
    return 0
  fi

  free_deploy_app_port
  start_app_via_nohup
  if port_is_listening; then
    date -u "+[deploy] %Y-%m-%dT%H:%M:%SZ app listening on ${DEPLOY_APP_PORT} (nohup)"
    return 0
  fi
  echo "ERROR: no se pudo reiniciar en el puerto ${DEPLOY_APP_PORT}. Configura sudoers para systemctl o revisa deploy-restart.log" >&2
  exit 1
}

verify_app_http() {
  if curl -sf -o /dev/null --max-time 15 "http://127.0.0.1:${DEPLOY_APP_PORT}/"; then
    date -u "+[deploy] %Y-%m-%dT%H:%M:%SZ HTTP OK en 127.0.0.1:${DEPLOY_APP_PORT}"
    if curl -sf --max-time 15 "http://127.0.0.1:${DEPLOY_APP_PORT}/sitemap.xml" | head -c 800 | grep -q "<urlset"; then
      date -u "+[deploy] %Y-%m-%dT%H:%M:%SZ sitemap.xml OK"
    else
      echo "WARN: /sitemap.xml no responde o está vacío" >&2
    fi
    return 0
  fi

  echo "WARN: HTTP falló; liberar puerto ${DEPLOY_APP_PORT} y reinicio forzado" >&2
  free_deploy_app_port
  if systemctl_unit start; then
    sleep 5
  else
    start_app_via_nohup
  fi
  if curl -sf -o /dev/null --max-time 15 "http://127.0.0.1:${DEPLOY_APP_PORT}/"; then
    date -u "+[deploy] %Y-%m-%dT%H:%M:%SZ HTTP OK tras reinicio forzado"
    return 0
  fi

  echo "ERROR: el puerto ${DEPLOY_APP_PORT} no responde HTTP (Caddy devolverá 502)." >&2
  tail -n 40 "${DEPLOY_PATH}/deploy-restart.log" 2>/dev/null || true
  journalctl -u "${SERVICE_NAME}.service" -n 40 --no-pager 2>/dev/null \
    || sudo -n journalctl -u "${SERVICE_NAME}.service" -n 40 --no-pager 2>/dev/null \
    || true
  exit 1
}

verify_app_html_matches_assets() {
  local home_chunk disk_path code html build_id html_build_id html_pages
  sleep 2

  if [ ! -f .next/app-build-manifest.json ]; then
    echo "ERROR: falta .next/app-build-manifest.json" >&2
    exit 1
  fi

  home_chunk=$(node -e "
    const m = require('./.next/app-build-manifest.json');
    const files = (m.pages && m.pages['/page']) || [];
    const hit = files.find((f) => /\\/app\\/page-[a-f0-9]+\\.js\$/.test(f));
    if (!hit) process.exit(2);
    console.log(hit.split('/').pop());
  ") || {
    echo "ERROR: no hay chunk de /page en app-build-manifest.json" >&2
    exit 1
  }

  disk_path=".next/static/chunks/app/${home_chunk}"
  if [ ! -f "$disk_path" ]; then
    echo "ERROR: falta en disco ${disk_path} (manifest pide ${home_chunk})" >&2
    exit 1
  fi

  code=$(curl -s -o /dev/null -w "%{http_code}" --max-time 15 \
    "http://127.0.0.1:${DEPLOY_APP_PORT}/_next/static/chunks/app/${home_chunk}")
  if [ "$code" != "200" ]; then
    echo "ERROR: /_next/static/chunks/app/${home_chunk} → HTTP ${code}" >&2
    exit 1
  fi

  if html=$(curl -sf --max-time 25 "http://127.0.0.1:${DEPLOY_APP_PORT}/" | head -c 900000); then
    if echo "$html" | grep -qE 'page-[a-f0-9]+\.js' 2>/dev/null; then
      if ! echo "$html" | grep -qF "$home_chunk" 2>/dev/null; then
        html_pages=$(echo "$html" | grep -oE 'page-[a-f0-9]+\.js' 2>/dev/null | sort -u | tr "\n" " " || true)
        echo "ERROR: HTML con chunks distintos del build (${html_pages}) vs ${home_chunk}" >&2
        exit 1
      fi
    fi
    if [ -f .next/BUILD_ID ]; then
      build_id=$(cat .next/BUILD_ID)
      html_build_id=$(echo "$html" | grep -oE '"buildId":"[^"]+"' 2>/dev/null | head -1 | sed 's/.*:"//;s/"$//' || true)
      if [ -n "$html_build_id" ] && [ "$html_build_id" != "$build_id" ]; then
        echo "ERROR: buildId incoherente (disco=${build_id}, HTML=${html_build_id})" >&2
        exit 1
      fi
    fi
  fi

  date -u "+[deploy] %Y-%m-%dT%H:%M:%SZ chunks OK (${home_chunk})"
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
npx prisma generate

if [ -f scripts/backfill-video-slugs.ts ] && [ -f lib/video-slug.ts ]; then
  date -u "+[deploy] %Y-%m-%dT%H:%M:%SZ backfill video slugs"
  npx tsx scripts/backfill-video-slugs.ts || echo "WARN: backfill-video-slugs falló (revisar logs)" >&2
elif [ -f scripts/backfill-video-slugs.ts ]; then
  echo "WARN: omitiendo backfill-video-slugs (falta lib/ en el bundle; incluir lib en deploy.tgz)" >&2
fi

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
verify_app_http
verify_app_html_matches_assets
date -u "+[deploy] %Y-%m-%dT%H:%M:%SZ done"
