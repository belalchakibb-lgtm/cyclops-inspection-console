@echo off
setlocal
set "NODE_EXE=C:\Program Files\nodejs\node.exe"
set "PROJECT_DIR=C:\Users\HP G6\Desktop\CYCLOPS"
set "SERVER=%PROJECT_DIR%\server.mjs"

if not exist "%NODE_EXE%" (
  echo Node.js was not found at "%NODE_EXE%".
  pause
  exit /b 1
)

cd /d "%PROJECT_DIR%"

for /f "tokens=5" %%P in ('netstat -ano 2^>nul ^| findstr :4173') do (
  if not "%%P"=="" (
    taskkill /F /PID %%P >nul 2>&1
  )
)

start "" /min "%NODE_EXE%" "%SERVER%" >"server.log" 2>&1

ping 127.0.0.1 -n 2 >nul

echo CYCLOPS is starting in the background.
echo Open http://127.0.0.1:4173/ in your browser.
pause
