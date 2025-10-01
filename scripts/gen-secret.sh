#!/usr/bin/env bash
# Generate a strong random secret (hex length 64 -> 32 bytes)
openssl rand -hex 48 2>/dev/null || python - <<'PY'
import secrets
print(secrets.token_hex(48))
PY