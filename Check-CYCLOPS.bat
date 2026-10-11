@echo off
setlocal
set "URL=http://127.0.0.1:4173/"

curl.exe -sS --max-time 3 "%URL%" >nul
if errorlevel 1 (
  echo CYCLOPS is not running.
  echo Double-click Start-CYCLOPS.bat first.
  exit /b 1
)

echo CYCLOPS is online: %URL%
