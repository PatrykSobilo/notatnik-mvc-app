# Deploy Guide (Docker + PM2)

## 1. Wariant Docker (rekomendowany)
### 1.1 Pierwsze uruchomienie
```bash
git clone https://github.com/PatrykSobilo/notatnik-mvc-app.git
cd notatnik-mvc-app
cp notatnik-backend/.env.example .env
# edytuj .env (DB_PASSWORD, JWT_SECRET, GEMINI_API_KEY)
COMMIT_SHA=$(git rev-parse --short HEAD) docker compose up -d --build
```
Sprawdź:
```bash
curl http://localhost:3000/health
curl http://localhost:3000/version
```

### 1.2 Aktualizacja aplikacji
```bash
git pull
COMMIT_SHA=$(git rev-parse --short HEAD) docker compose build --pull
COMMIT_SHA=$(git rev-parse --short HEAD) docker compose up -d
curl http://localhost:3000/version
```

### 1.3 Produkcyjne różnice
Użyj `docker-compose.prod.yml`:
```bash
COMMIT_SHA=$(git rev-parse --short HEAD) docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d --build
```

## 2. Backup i Restore Postgres
### 2.1 Backup (snapshot)
```bash
docker exec -t notatnik-db pg_dump -U ${DB_USER:-postgres} -d ${DB_NAME:-notatnik_db} > backup_$(date +%F).sql
```
### 2.2 Restore
```bash
docker exec -i notatnik-db psql -U ${DB_USER:-postgres} -d ${DB_NAME:-notatnik_db} < backup_2025-10-01.sql
```

## 3. Rotacja sekretów (skrót)
Patrz `ROTATE_SECRETS.md`. Po zmianie sekretów:
```bash
COMMIT_SHA=$(git rev-parse --short HEAD) docker compose up -d
```

## 4. Wariant PM2 (fallback / bez Dockera)
### 4.1 Backend
```bash
cd notatnik-backend
cp .env.example .env
npm install
npm install -g pm2
pm2 start server.js --name notatnik-api
pm2 save
```
### 4.2 Frontend (statyczny build)
```bash
cd notatnik-frontend
npm install
npm run build
# skopiuj dist/ do /var/www/notatnik i skonfiguruj nginx
```
Przykład minimalnego vhost Nginx:
```
server {
  listen 80;
  server_name example.com;
  root /var/www/notatnik;
  location /api/ { proxy_pass http://127.0.0.1:3000/api/; }
  add_header Cache-Control "no-store";
}
```

## 5. Health / Observability
- `GET /health` – baza + status aplikacji
- `GET /version` – commit + buildTime

## 6. Czyszczenie
```bash
docker compose down -v
# lub mocniej
docker system prune -af --volumes
```

## 7. Typowe problemy
| Problem | Rozwiązanie |
|---------|-------------|
| Health: database disconnected | Sprawdź hasło w .env i logi db (`docker compose logs db`) |
| 404 /version | Brak aktualnego obrazu – przebuduj `--no-cache` |
| Stary frontend w przeglądarce | DevTools → Disable cache → Hard reload |
| JWT invalid po restarcie | Upewnij się, że nie zmieniłeś JWT_SECRET przypadkiem |

## 8. Security checklist (skrót)
- `.env` chmod 600 (produkcja)
- Silne sekrety (≥ 32 znaki hex)
- Rotacja co X miesięcy lub po incydencie
- Kopia bezpieczeństwa bazy (codziennie cron)

## 9. Generowanie sekretów
Zobacz: `scripts/gen-secret.sh` / `scripts/gen-secret.ps1`.

---
Aktualizuj ten dokument gdy pojawi się reverse proxy lub HTTPS automation (np. Caddy / Traefik / Nginx + certbot).
