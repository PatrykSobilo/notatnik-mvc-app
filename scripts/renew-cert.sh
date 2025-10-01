#!/usr/bin/env sh
# Simple helper to renew Let's Encrypt certificates using the standalone method.
# Assumes docker volume `letsencrypt-data` already exists and port 80 can be bound temporarily.
# After a successful renewal it reloads the running nginx proxy (no full restart).

set -eu

STACK_DIR=${STACK_DIR:-/opt/notatnik/app}
COMPOSE="docker compose -f ${STACK_DIR}/docker-compose.yml -f ${STACK_DIR}/docker-compose.prod.yml"

echo "[renew-cert] Starting renewal attempt..."

docker run --rm -p 80:80 -v letsencrypt-data:/etc/letsencrypt certbot/certbot renew --standalone --quiet || {
  echo "[renew-cert] Renewal command failed" >&2
  exit 1
}

echo "[renew-cert] Renewal finished. Reloading nginx..."
$COMPOSE exec -T proxy nginx -s reload || echo "[renew-cert] Warning: nginx reload failed"

echo "[renew-cert] Done."