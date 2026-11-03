# Starts CYCLOPS: checks Node.js, asks for the AI key once (saved in .env), starts the server, opens the browser.
$ErrorActionPreference = 'Stop'
Set-Location $PSScriptRoot
$port = 4173
$url = "http://127.0.0.1:$port/"
$envFile = Join-Path $PSScriptRoot '.env'

function Get-EnvValue([string]$name) {
  if (Test-Path $envFile) {
    foreach ($line in [IO.File]::ReadAllLines($envFile)) {
      if ($line -match "^\s*$name\s*=\s*(.*)$") { return $Matches[1].Trim().Trim('"') }
    }
  }
  return $null
}

function Set-EnvValue([string]$name, [string]$value) {
  $lines = @()
  if (Test-Path $envFile) { $lines = @([IO.File]::ReadAllLines($envFile) | Where-Object { $_ -notmatch "^\s*$name\s*=" }) }
  $lines += "$name=$value"
  [IO.File]::WriteAllLines($envFile, [string[]]$lines)   # UTF-8 without BOM
}

# 1. Node.js
$node = (Get-Command node -ErrorAction SilentlyContinue).Source
if (-not $node -and (Test-Path 'C:\Program Files\nodejs\node.exe')) { $node = 'C:\Program Files\nodejs\node.exe' }
if (-not $node) {
  Write-Host 'Node.js is not installed. Install the LTS version from https://nodejs.org then run this again.' -ForegroundColor Red
  Read-Host 'Press Enter to close'
  exit 1
}

# 2. AI key (asked once, then remembered in .env)
$hasKey = $env:NVIDIA_API_KEY -or $env:ANTHROPIC_API_KEY -or (Get-EnvValue 'NVIDIA_API_KEY') -or (Get-EnvValue 'ANTHROPIC_API_KEY')
if (-not $hasKey) {
  Write-Host ''
  Write-Host 'No AI key saved yet.' -ForegroundColor Yellow
  Write-Host 'Get one at https://build.nvidia.com (it starts with nvapi-).'
  $keyInput = Read-Host 'Paste your NVIDIA API key, or press Enter to run without AI'
  if ($keyInput -and $keyInput.Trim().Length -gt 0) {
    $key = $keyInput.Trim()
    if (-not $key.StartsWith('nvapi-')) { Write-Host 'Warning: NVIDIA keys normally start with nvapi-. Saving it anyway.' -ForegroundColor Yellow }
    Set-EnvValue 'NVIDIA_API_KEY' $key
    Write-Host 'Key saved in .env (private file, not sent to git). You will not be asked again.' -ForegroundColor Green
    Write-Host 'To change it later, edit or delete the .env file.'
  } else {
    Write-Host 'Starting without AI: the assistant will use offline answers from the procedures.' -ForegroundColor Yellow
  }
}

# 3. Stop any older CYCLOPS still holding the port
$connections = Get-NetTCPConnection -LocalPort $port -State Listen -ErrorAction SilentlyContinue
foreach ($processId in ($connections | Select-Object -ExpandProperty OwningProcess -Unique)) {
  try { Stop-Process -Id $processId -Force -ErrorAction Stop; Write-Host "Stopped the previous server (process $processId)." } catch {}
}
Start-Sleep -Milliseconds 400

# 4. Start the server in this window, open the browser when it answers
Write-Host ''
Write-Host "Starting CYCLOPS on $url  (close this window or press Ctrl+C to stop it)" -ForegroundColor Cyan
$server = Start-Process -FilePath $node -ArgumentList 'server.mjs' -NoNewWindow -PassThru
$ready = $false
for ($i = 0; $i -lt 30 -and -not $server.HasExited; $i++) {
  Start-Sleep -Milliseconds 300
  try { Invoke-WebRequest -Uri "${url}api/health" -UseBasicParsing -TimeoutSec 2 | Out-Null; $ready = $true; break } catch {}
}
if ($ready) {
  Start-Process $url
} elseif ($server.HasExited) {
  Write-Host 'The server stopped with an error (see the message above).' -ForegroundColor Red
  Read-Host 'Press Enter to close'
  exit 1
}
Wait-Process -Id $server.Id
