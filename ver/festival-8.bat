@echo off
rem Abre la solucion del worktree festival-8 (rama festival-8) en http://localhost:3008
title Festival Niebla - festival-8
cd /d "%~dp0..\..\ClaudeModelFusions-wt\festival-8" || (echo No existe el worktree festival-8 & pause & exit /b 1)
if not exist node_modules call npm install || (pause & exit /b 1)
echo Compilando festival-8...
call npm run build || (echo El build fallo. & pause & exit /b 1)
start "" /min cmd /c "timeout /t 6 >nul & start http://localhost:3008"
call npx next start -p 3008
pause
