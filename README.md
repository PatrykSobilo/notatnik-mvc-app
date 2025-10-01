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
## 🧪 Test zdrowia
```bash
curl http://localhost:3000/health
```
Oczekiwany JSON z `status: OK`.

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

> Jeśli czegoś brakuje – otwórz Issue.
