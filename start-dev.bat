@echo off
cd /d "%~dp0"
echo Starting Vite development server...
call npx vite --port 8080
pause
