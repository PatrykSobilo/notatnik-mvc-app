# Manual API Test Script for Notatnik Backend
# Uruchom w PowerShell: kliknij prawym w folderze projektu "Open in Terminal" albo w oknie już otwartym będąc w katalogu projektu.
# Edytuj wartości jeśli chcesz inne dane użytkownika.

$Base = 'http://localhost:3000'
$Username = 'testuser1'
$Password = 'haslo123'
$Email    = 'testuser1@example.com'

Write-Host "[1] Rejestracja (jeśli użytkownik istnieje pojawi się 409)" -ForegroundColor Cyan
$registerBody = @{ username=$Username; email=$Email; password=$Password } | ConvertTo-Json
try {
  $reg = Invoke-RestMethod -Method POST -Uri "$Base/api/auth/register" -ContentType 'application/json' -Body $registerBody -ErrorAction Stop
  Write-Host "Zarejestrowano: $($reg.user.username)" -ForegroundColor Green
} catch {
  if ($_.Exception.Response.StatusCode.Value__ -eq 409) {
    Write-Host "Użytkownik już istnieje - kontynuuję" -ForegroundColor Yellow
  } else {
    Write-Host "Błąd rejestracji: $_" -ForegroundColor Red
  }
}

Write-Host "[2] Logowanie" -ForegroundColor Cyan
$loginBody = @{ username=$Username; password=$Password } | ConvertTo-Json
$login = Invoke-RestMethod -Method POST -Uri "$Base/api/auth/login" -ContentType 'application/json' -Body $loginBody
$TOKEN = $login.token
Write-Host "Token pobrany (skrócony): $($TOKEN.Substring(0,25))..." -ForegroundColor Green
$Headers = @{ Authorization = "Bearer $TOKEN" }

Write-Host "[3] Verify token" -ForegroundColor Cyan
Invoke-RestMethod -Method GET -Uri "$Base/api/auth/verify" -Headers $Headers | Out-Host

Write-Host "[4] Tworzenie notatki" -ForegroundColor Cyan
$noteBody = @{ title='Test Notatka'; content='Treść testowej notatki do AI'; tags=@('test','ai') } | ConvertTo-Json
$noteCreate = Invoke-RestMethod -Method POST -Uri "$Base/api/notes" -Headers $Headers -ContentType 'application/json' -Body $noteBody
# Struktura: { success, message, data = { id, ... } }
if ($noteCreate.data -and $noteCreate.data.id) {
  $noteId = $noteCreate.data.id
  Write-Host "Utworzono notatke ID=$noteId" -ForegroundColor Green
} else {
  Write-Host "Nie udalo sie odczytac ID notatki (odpowiedz): $($noteCreate | ConvertTo-Json -Depth 5)" -ForegroundColor Yellow
}

Write-Host "[5] Lista notatek" -ForegroundColor Cyan
$notes = Invoke-RestMethod -Method GET -Uri "$Base/api/notes" -Headers $Headers
$notes | Select-Object id,title,created_at | Out-Host

Write-Host "[6] Status AI" -ForegroundColor Cyan
$aiStatus = Invoke-RestMethod -Method GET -Uri "$Base/api/ai/status" -Headers $Headers
$aiStatus | Out-Host

Write-Host "[7] Lista modeli (SDK)" -ForegroundColor Cyan
try {
  $modelsSdk = Invoke-RestMethod -Method GET -Uri "$Base/api/ai/models" -Headers $Headers -ErrorAction Stop
  $modelsSdk | Out-Host
} catch {
  Write-Host "Blad pobierania modeli SDK: $_" -ForegroundColor Yellow
}

Write-Host "[8] Surowa lista modeli (REST)" -ForegroundColor Cyan
try {
  $rawModels = Invoke-RestMethod -Method GET -Uri "$Base/api/ai/models/raw" -Headers $Headers -ErrorAction Stop
  if ($rawModels.data) { $rawModels.data | Select-Object name, displayName | Out-Host } else { Write-Host "Brak modeli w odpowiedzi" -ForegroundColor Yellow }
} catch {
  Write-Host "Raw endpoint brak / blad: $_" -ForegroundColor Red
}

# Wybierz pierwszy model z listy raw (jeśli istnieje), inaczej fallback do zmiennej środowiskowej
if ($rawModels -and $rawModels.data -and $rawModels.data.Count -gt 0) {
  $modelName = $rawModels.data[0].name
} else {
  if ($modelsSdk -and $modelsSdk.data -and $modelsSdk.data.models -and $modelsSdk.data.models.Count -gt 0) {
    $modelName = $modelsSdk.data.models[0].name
  } else {
    $modelName = 'gemini-pro'
  }
  if (-not $modelName) { $modelName = 'gemini-pro' }
}
Write-Host "Wybrany model do testu raw-generate: $modelName" -ForegroundColor Yellow

Write-Host "[9] Surowy test generateContent" -ForegroundColor Cyan
$genBody = @{ modelName=$modelName; prompt='Krótki test odpowiedzi AI' } | ConvertTo-Json
try {
  $gen = Invoke-RestMethod -Method POST -Uri "$Base/api/ai/models/raw-generate" -Headers $Headers -ContentType 'application/json' -Body $genBody -ErrorAction Stop
  ($gen.data.candidates | Select-Object -First 1) | Out-Host
} catch {
  Write-Host "Raw generate błąd: $_" -ForegroundColor Red
}

Write-Host "[10] Persistent chat" -ForegroundColor Cyan
$chatBody = @{ noteId=$noteId; noteTitle='Test Notatka'; noteContent='Treść testowej notatki do AI'; message='Cześć, potrzebuję krótkiej porady.' } | ConvertTo-Json
try {
  $chat = Invoke-RestMethod -Method POST -Uri "$Base/api/ai/chat/persistent" -Headers $Headers -ContentType 'application/json' -Body $chatBody -ErrorAction Stop
  $chat.data | Select-Object sessionId,response | Out-Host
} catch {
  Write-Host "Chat błąd: $_" -ForegroundColor Red
}

Write-Host "[11] Sesje czatu" -ForegroundColor Cyan
try {
  $sessions = Invoke-RestMethod -Method GET -Uri "$Base/api/ai/sessions" -Headers $Headers
  $sessions.data | Select-Object id,note_id,created_at | Out-Host
} catch { Write-Host "Sesje błąd: $_" -ForegroundColor Red }

Write-Host "[12] Gotowe. Jesli AI nadal nie odpowiada i masz 404 modeli - skopiuj powyzsze sekcje bledow." -ForegroundColor Green
