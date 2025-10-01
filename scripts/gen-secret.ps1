Param(
  [int]$Bytes = 48
)
# Generates a hex secret (2 chars per byte)
try {
  $rng = [System.Security.Cryptography.RandomNumberGenerator]::Create()
  $data = New-Object byte[] ($Bytes)
  $rng.GetBytes($data)
  ($data | ForEach-Object { $_.ToString('x2') }) -join ''
} catch {
  Write-Error $_.Exception.Message
  exit 1
}