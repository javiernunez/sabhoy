#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")/.."

echo "=== Deploy sabhoy.es (zero-downtime) ==="

# 1. Load env
if [ -f .env ]; then
  set -a; source .env; set +a
fi

# 2. Build into temporary directory
echo "→ Building into .next-build ..."
rm -rf .next-build
NEXT_BUILD_DIR=.next-build ./node_modules/.bin/next build

# 3. Atomic swap
echo "→ Swapping .next → .next-old, .next-build → .next ..."
rm -rf .next-old
if [ -d .next ]; then
  mv .next .next-old
fi
mv .next-build .next

# 4. Restart Next.js
echo "→ Restarting next-server ..."
NEXT_PID=$(pgrep -f "next-server" 2>/dev/null | head -1 || true)
if [ -n "$NEXT_PID" ]; then
  kill "$NEXT_PID" 2>/dev/null || true
  sleep 2
  # The parent shell process (sh -c next start) should restart it
  # If not, start it manually
  if ! pgrep -f "next-server" > /dev/null 2>&1; then
    echo "→ Starting next start in background ..."
    nohup npm run start > /dev/null 2>&1 &
    sleep 3
  fi
else
  echo "→ No running next-server found, starting ..."
  nohup npm run start > /dev/null 2>&1 &
  sleep 3
fi

# 5. Cleanup
rm -rf .next-old

echo "→ Verifying ..."
if pgrep -f "next-server" > /dev/null 2>&1; then
  echo "✓ Deploy complete — next-server running"
else
  echo "✗ Warning: next-server not detected. Check manually."
  exit 1
fi
