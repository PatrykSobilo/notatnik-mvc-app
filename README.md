# Notatnik MVC App

Nowoczesna aplikacja do zarządzania notatkami z uwierzytelnianiem użytkowników, integracją AI (Gemini) oraz wersjami uruchomienia: lokalną, Docker i (opcjonalnie) PM2/systemd.

---
## 🚀 Funkcje
- Rejestracja / logowanie z JWT (7 dni ważności)
- Tworzenie, edycja, usuwanie i wyszukiwanie notatek
- Relacje użytkownik → notatki (PostgreSQL + indeksy)
- Wstępny szkielet czatu AI (endpointy /ai/... po stronie backendu do rozbudowy)
- Konteneryzacja (backend, frontend, PostgreSQL) + healthchecki
- Hardened CORS + middleware walidacji i sanityzacji wejścia

---
## 🧱 Architektura
```
/frontend (Vite + React) --> komunikuje się z --> /backend (Express + PostgreSQL)
                                                ↳ baza danych (Postgres)
```
Komunikacja HTTP REST (`/api/*`). Token JWT w nagłówku `Authorization: Bearer <token>`.

---
## 🗂 Struktura katalogów (skrót)
```
notatnik-backend/
  server.js
  db/
  controllers/
  routes/
  middleware/
  Dockerfile
notatnik-frontend/
  src/
  Dockerfile
Dockerfile (x2), docker-compose.yml
```

---
## 🔧 Wymagania wstępne
- Node.js 18+
- PostgreSQL 15+ (lokalnie) lub Docker
- (Opcjonalnie) PM2 do produkcji bez Dockera
- Klucz API Gemini (jeśli chcesz używać AI)

---
## 🏁 Szybki start (Lokalnie – bez Dockera)
### 1. Backend
```bash
cd notatnik-backend
cp .env.example .env   # edytuj wartości
npm install
npm start              # lub: node server.js
```
### 2. Frontend
```bash
cd notatnik-frontend
npm install
npm run dev
```
Domyślne adresy:
- Backend: http://localhost:3000
- Frontend (dev): http://localhost:5173

---
## 🐳 Uruchomienie przez Docker
Upewnij się, że w katalogu głównym masz `.env` (możesz skopiować z `notatnik-backend/.env.example` i dostosować). Następnie:
```bash
docker compose up --build -d
```
Serwisy:
- Frontend: http://localhost:3001
- Backend API: http://localhost:3000
- Postgres: localhost:5432

Sprawdzenie stanu:
```bash
docker compose ps
docker compose logs -f backend
```

Zatrzymanie:
```bash
docker compose down
```
Z zachowaniem danych (wolumen `db_data`). Jeśli chcesz usunąć dane:
```bash
docker compose down -v
```

---
## 🌱 Zmienne środowiskowe
Plik wzorcowy: `notatnik-backend/.env.example`
Kluczowe zmienne:
- `PORT` – port backendu (3000)
- `NODE_ENV` – `development` / `production`
- `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`
- `FRONTEND_URL` – adres frontendu dla CORS
- `JWT_SECRET` – silny losowy sekret (min. 32 znaki)
- `JWT_EXPIRES` – domyślnie `7d`
- `GEMINI_API_KEY` – klucz do API Gemini (tylko backend!)
- `GEMINI_API_URL` – endpoint modelu (domyślny przykład w pliku)
- `COMMIT_SHA` – opcjonalne, wyświetlane w `/version` (wstrzykiwane przy deploy)

Nigdy nie commituj realnych sekretów. `.env` jest w `.gitignore`.

---
## 🔐 Bezpieczeństwo
- Zmienione: docker-compose nie zawiera już twardych haseł – używa zmiennych.
- Sekrety lokalnie: `.env` (niecommitowany) + ewentualnie menedżer haseł / Vault.
- Przy produkcji Docker: użyj `docker secret` lub zewn. zarządzania (np. dopisanie w CI).
- Regeneruj `JWT_SECRET` i `DB_PASSWORD` przy incydencie.

### Rotacja sekretów (skrót)
1. Wygeneruj nowe wartości offline (np. `openssl rand -hex 48`).
2. Zaktualizuj nowe zmienne w `.env` / sekretach Dockera.
3. Zrestartuj backend (kontener / proces).
4. Zablokuj stary klucz API Gemini w panelu (jeśli rotujesz GEMINI_API_KEY).
5. Wymuś ponowne logowanie użytkowników (jeśli zmieniasz `JWT_SECRET`).

---
## ☸️ Deploy (warianty)
### A. Docker (rekomendowane)
Na serwerze:
```bash
git clone https://github.com/PatrykSobilo/notatnik-mvc-app.git
cd notatnik-mvc-app
cp notatnik-backend/.env.example .env
# edytuj .env (silne hasła)
docker compose up -d --build
```
Aktualizacja:
```bash
git pull
docker compose pull
docker compose up -d --build
```
### B. PM2 (bez Docker)
```bash
cd notatnik-backend
cp .env.example .env
npm install
pm2 start server.js --name notatnik-api
```
Frontend możesz zbudować i podać przez nginx:
```bash
cd notatnik-frontend
npm install
npm run build
# skopiuj dist/ do /var/www/notatnik i skonfiguruj nginx
```

---
## 🧪 Test zdrowia i wersji
```bash
curl http://localhost:3000/health
curl http://localhost:3000/version
```
`/version` zwraca JSON z `commit`, `buildTime`, `environment`.

---
## 🛠 Typowe problemy
| Problem | Rozwiązanie |
|---------|-------------|
| `ECONNREFUSED` do Postgres | Sprawdź `docker compose logs db` oraz healthcheck |
| 401 po logowaniu | Sprawdź poprawność `JWT_SECRET` vs restart backendu |
| CORS error | Upewnij się, że `FRONTEND_URL` zgadza się z originem |
| Brak `GEMINI_API_KEY` | Dodaj do `.env` (backend) – nie w frontendzie |

---
## 📦 Build produkcyjny frontendu lokalnie
```bash
cd notatnik-frontend
npm run build
npx serve dist
```

---
## 📄 Licencja
(Jeśli potrzebujesz licencji – dodaj np. MIT LICENSE)

---
## 🤝 Kontrybucje
Pull Requesty i Issue mile widziane.

---
## ✅ Status ostatnich zmian
- Dodano `.env.example`
- Zsanityzowano śledzone `.env`
- Ulepszono `docker-compose.yml` (healthcheck, network, brak twardych haseł)

---
## 🌐 Produkcyjna domena + HTTPS (sobit.uk)

Konfiguracja produkcyjna używa kontenera `proxy` (Nginx) z własnym obrazem budowanym z katalogu `nginx/`. Certyfikaty Let's Encrypt są przechowywane w *zewnętrznym* volume Dockera: `letsencrypt-data`.

### Kroki jednorazowe (uzyskanie certyfikatu)
1. Utwórz volume:
  ```bash
  docker volume create letsencrypt-data
  ```
2. Zatrzymaj proxy jeśli nasłuchuje na porcie 80 (albo jeszcze nie wystartowałeś stacka):
  ```bash
  docker compose -f docker-compose.yml -f docker-compose.prod.yml stop proxy
  ```
3. Uruchom certbot w trybie standalone (zastąpi tymczasowo serwer na :80):
  ```bash
  docker run --rm -it -p 80:80 \
    -v letsencrypt-data:/etc/letsencrypt \
    certbot/certbot certonly --standalone \
    -d sobit.uk -d www.sobit.uk \
    --agree-tos -m <twoj@email> --no-eff-email --rsa-key-size 4096
  ```
4. Zweryfikuj pliki:
  ```bash
  docker run --rm -v letsencrypt-data:/etc/letsencrypt alpine ls -l /etc/letsencrypt/live/sobit.uk
  ```
5. Zbuduj obraz proxy z nowym configiem (plik `nginx/conf.d/sobit.uk.conf` zawiera bloki 80→301 i 443 SSL):
  ```bash
  docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d --build proxy
  ```

Po starcie: `curl -I http://sobit.uk` powinno zwrócić `301 Location: https://sobit.uk/`, a `curl -I https://sobit.uk` nagłówek `Strict-Transport-Security`.

### Struktura certów wewnątrz kontenera
```
/etc/letsencrypt/live/sobit.uk/fullchain.pem
/etc/letsencrypt/live/sobit.uk/privkey.pem
```
Montowane read‑only do kontenera `proxy`.

### Zmienne środowiskowe a CORS
W pliku `.env` ustawiono `FRONTEND_ORIGIN=https://sobit.uk` aby backend akceptował zapytania z domeny produkcyjnej.

### Aktualizacja kodu w produkcji (pull & redeploy)
```bash
git pull
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d --build
```

---
## 🔄 Automatyczne odnowienie certyfikatu Let's Encrypt

Certyfikaty ważne 90 dni. Zalecane uruchamianie `certbot renew` raz dziennie. Ponieważ używamy volume `letsencrypt-data`, wystarczy okresowo uruchomić kontener certbota.

### Cron na hoście (prosty wariant)
Edytuj crontab root:
```bash
sudo crontab -e
```
Dodaj linię (odpal raz dziennie o 03:15 UTC):
```cron
15 3 * * * docker run --rm -v letsencrypt-data:/etc/letsencrypt -p 80:80 certbot/certbot renew --standalone --quiet && docker compose -f /opt/notatnik/app/docker-compose.yml -f /opt/notatnik/app/docker-compose.prod.yml exec -T proxy nginx -s reload
```

Mechanizm: jeśli którykolwiek cert zbliża się do wygaśnięcia – zostanie odnowiony, a na końcu wykonujemy reload Nginx (bez restartu kontenera).

### Ręczne sprawdzenie czasu ważności
```bash
docker run --rm -v letsencrypt-data:/etc/letsencrypt alpine sh -c "openssl x509 -in /etc/letsencrypt/live/sobit.uk/fullchain.pem -noout -enddate"
```

### Test „dry run” odnowienia
```bash
docker run --rm -v letsencrypt-data:/etc/letsencrypt -p 80:80 certbot/certbot renew --dry-run --standalone
```

---
## 🤖 Endpointy AI (skrót)

| Endpoint | Metoda | Opis |
|----------|--------|------|
| `/api/ai/status` | GET | Status dostępności modelu i aktywna nazwa |
| `/api/ai/models/raw` | GET | Surowa lista modeli z API dostawcy |
| `/api/ai/models/raw-generate` | POST | Test jednorazowego promptu (diagnostyka) |
| `/api/ai/chat/persistent` | POST | Wysyła wiadomość i utrzymuje historię czatu (sessionId) |
| `/api/ai/sessions` | GET | Lista sesji użytkownika |
| `/api/ai/sessions/:id/messages` | GET | Historia wiadomości danej sesji |
| `/api/ai/sessions/:id` | DELETE | Usunięcie sesji + wiadomości |
| `/api/ai/model` | POST | Dynamiczna zmiana modelu (np. `{"model":"gemini-2.5-pro"}`) |

Nagłówek autoryzacji: `Authorization: Bearer <JWT>`.

### Przykład wywołania persistent chat
```bash
curl -s -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
  -d '{"message":"Pomóż streścić notatkę","noteId":123,"noteTitle":"Tytuł","noteContent":"Treść"}' \
  https://sobit.uk/api/ai/chat/persistent
```

### Zmiana modelu
```bash
curl -s -X POST -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
  -d '{"model":"gemini-2.5-pro"}' https://sobit.uk/api/ai/model
```

---
## 🧹 Opcjonalne czyszczenie sesji AI
```bash
curl -s -H "Authorization: Bearer $TOKEN" https://sobit.uk/api/ai/sessions
curl -s -H "Authorization: Bearer $TOKEN" https://sobit.uk/api/ai/sessions/<SESSION_ID>/messages
curl -X DELETE -H "Authorization: Bearer $TOKEN" https://sobit.uk/api/ai/sessions/<SESSION_ID>
```

---
## 📌 TODO (infra / AI)
- Dodać testy jednostkowe dla warstwy AI fallback
- (Opcjonalnie) kontener watchdog do monitorowania ważności certów
- Możliwa migracja do HTTP/3 (quic) w przyszłości

> Jeśli czegoś brakuje – otwórz Issue.
