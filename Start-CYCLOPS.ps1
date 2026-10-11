$ErrorActionPreference = 'Stop'
$server = Join-Path $PSScriptRoot 'server.mjs'
$port = 4173

function Stop-ExistingServer {
  $connections = Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue
  if (-not $connections) { return }

  $pids = $connections | Select-Object -ExpandProperty OwningProcess -Unique
  foreach ($processId in $pids) {
    try {
      $process = Get-Process -Id $processId -ErrorAction Stop
      if ($process) {
        Stop-Process -Id $processId -Force -ErrorAction Stop
        Write-Host "Stopped previous process $processId using port $port."
      }
    }
    catch {
      Write-Host "No active process found for PID $processId on port $port."
    }
  }
}

if (-not $env:NVIDIA_API_KEY -and -not $env:ANTHROPIC_API_KEY) {
  $keyInput = Read-Host 'New NVIDIA API key (press Enter for local-only mode)'
  if ($keyInput -and $keyInput.Trim().Length -gt 0) {
    $env:NVIDIA_API_KEY = $keyInput.Trim()
  }
}

if (-not $env:NVIDIA_MODEL) {
  $env:NVIDIA_MODEL = 'meta/llama-3.2-11b-vision-instruct'
}
if (-not $env:NVIDIA_MAX_TOKENS) {
  $env:NVIDIA_MAX_TOKENS = '400'
}
if (-not $env:AI_TIMEOUT_MS) {
  $env:AI_TIMEOUT_MS = '30000'
}

if (-not $env:NVIDIA_API_KEY -and -not $env:ANTHROPIC_API_KEY) {
  Write-Host 'No AI key supplied. Starting in local-only mode.'
}

Stop-ExistingServer
Write-Host "Starting CYCLOPS on http://127.0.0.1:$port"
Write-Host "Using NVIDIA model $env:NVIDIA_MODEL with max_tokens=$env:NVIDIA_MAX_TOKENS"
& node $server