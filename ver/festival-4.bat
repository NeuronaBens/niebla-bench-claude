@echo off
rem Abre la solucion del worktree festival-4 (rama festival-4) en http://localhost:3004
title Festival Niebla - festival-4
cd /d "%~dp0..\..\ClaudeModelFusions-wt\festival-4" || (echo No existe el worktree festival-4 & pause & exit /b 1)
if not exist node_modules call npm install || (pause & exit /b 1)
echo Compilando festival-4...
call npm run build || (echo El build fallo. & pause & exit /b 1)
start "" /min cmd /c "timeout /t 6 >nul & start http://localhost:3004"
call npx next start -p 3004
pause
