@echo off
echo ==============================================
echo    URUCHAMIANIE CAŁEGO PROJEKTU NOTATNIK
echo ==============================================
echo.
echo Ten skrypt uruchomi backend i frontend jednoczesnie
echo Backend: http://localhost:3000
echo Frontend: http://localhost:3002
echo.
echo Uruchamianie...

cd /d "c:\Users\PatrykSobiło\OneDrive - Digital Mind AS\Pulpit\Osobiste\Programowanie\Node.js i API i reszta\PrzyszlyProgramista\notatnik"

echo.
echo [1/2] Uruchamianie backendu...
start "Notatnik Backend" cmd /k "cd notatnik-backend && echo Backend dziala na porcie 3000 && node server.js"

timeout /t 3 /nobreak >nul

echo [2/2] Uruchamianie frontendu...
start "Notatnik Frontend" cmd /k "cd notatnik-frontend && echo Frontend dziala na porcie 3002 && npm run dev"

echo.
echo ==============================================
echo    PROJEKT URUCHOMIONY!
echo ==============================================
echo.
echo Backend: http://localhost:3000
echo Frontend: http://localhost:3002
echo.
echo Otwórz przeglądarkę i przejdź do:
echo http://localhost:3002
echo.
echo Aby zatrzymać, zamknij oba okna terminali.
echo.

pause
