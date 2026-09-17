@echo off
rem Abre la solucion del worktree festival-2 (rama festival-2) en http://localhost:3002
title Festival Niebla - festival-2
cd /d "%~dp0..\..\ClaudeModelFusions-wt\festival-2" || (echo No existe el worktree festival-2 & pause & exit /b 1)
if not exist node_modules call npm install || (pause & exit /b 1)
echo Compilando festival-2...
call npm run build || (echo El build fallo. & pause & exit /b 1)
start "" /min cmd /c "timeout /t 6 >nul & start http://localhost:3002"
call npx next start -p 3002
pause
