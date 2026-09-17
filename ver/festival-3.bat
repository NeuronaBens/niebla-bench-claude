@echo off
rem Abre la solucion del worktree festival-3 (rama festival-3) en http://localhost:3003
title Festival Niebla - festival-3
cd /d "%~dp0..\..\ClaudeModelFusions-wt\festival-3" || (echo No existe el worktree festival-3 & pause & exit /b 1)
if not exist node_modules call npm install || (pause & exit /b 1)
echo Compilando festival-3...
call npm run build || (echo El build fallo. & pause & exit /b 1)
start "" /min cmd /c "timeout /t 6 >nul & start http://localhost:3003"
call npx next start -p 3003
pause
