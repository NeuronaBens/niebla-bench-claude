@echo off
rem Abre la solucion del worktree festival-1 (rama festival-1) en http://localhost:3001
title Festival Niebla - festival-1
cd /d "%~dp0..\..\ClaudeModelFusions-wt\festival-1" || (echo No existe el worktree festival-1 & pause & exit /b 1)
if not exist node_modules call npm install || (pause & exit /b 1)
echo Compilando festival-1...
call npm run build || (echo El build fallo. & pause & exit /b 1)
start "" /min cmd /c "timeout /t 6 >nul & start http://localhost:3001"
call npx next start -p 3001
pause
