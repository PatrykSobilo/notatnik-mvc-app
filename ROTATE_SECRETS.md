# Sekret Rotation Checklist

Krótka checklista do bezpiecznej rotacji kluczowych sekretów aplikacji.

## 1. GEMINI_API_KEY
1. Wygeneruj nowy klucz w panelu Google AI Studio.
2. Zaktualizuj `.env` (backend) – stary zostaw tymczasowo jako GEMINI_API_KEY_OLD (opcjonalnie).
3. Zrestartuj backend (Docker: `docker compose restart backend`).
4. Przetestuj endpointy AI / logi błędów.
5. Skasuj stary klucz w panelu Google.

## 2. JWT_SECRET
1. Wybierz nowe losowe 48+ znaków (np. `openssl rand -hex 48`).
2. Ustaw `JWT_SECRET_NEW` obok starego w backend (kod możesz rozszerzyć aby akceptował oba przez okres przejściowy – TODO).
3. Zrestartuj backend.
4. Wymuś ponowne logowanie (wyczyść lokalnie tokeny lub zmień `JWT_SECRET` od razu – wtedy wszystkie stare JWT unieważnione).
5. Usuń starą wartość po oknie migracji.

## 3. DB_PASSWORD (Postgres)
1. W bazie: ALTER USER postgres WITH PASSWORD 'NOWE_HASLO';
2. Zaktualizuj `.env` + (jeśli Docker) zrestartuj: `docker compose up -d backend db` (może wymagać przebudowy w zależności od konfiguracji).
3. Sprawdź połączenie: `docker compose logs backend | grep Połączono`.
4. Usuń starą wartość z menedżera haseł.

## 4. Inne (np. GEMINI_API_URL)
Zmieniaj tylko jeśli Google zmieni endpoint; restart backendu po aktualizacji.

## 5. Audit po rotacji
- Przejrzyj commit history: brak sekretów.
- Użyj narzędzia typu `trufflehog` lokalnie przed pushem.
- Sprawdź uprawnienia katalogów (produkcja): `.env` 600.

## 6. Incydent bezpieczeństwa – procedura skrócona
1. Natychmiast rotuj GEMINI_API_KEY i JWT_SECRET.
2. Wymuś wylogowanie (zastąp JWT_SECRET bez okresu przejściowego).
3. Przejrzyj logi pod kątem nadużyć.
4. Zaktualizuj wszystkie zależności (npm audit fix --force tylko jeśli konieczne).
5. Utwórz raport post-mortem.

---
Dokument aktualizuj przy każdej rotacji. PR z datą i zakresem zmian.
