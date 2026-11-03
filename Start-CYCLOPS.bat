@echo off
rem Double-click this file to start CYCLOPS.
cd /d "%~dp0"
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0Start-CYCLOPS.ps1"
if errorlevel 1 pause
