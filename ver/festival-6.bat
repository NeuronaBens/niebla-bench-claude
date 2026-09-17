@echo off
rem Abre la solucion del worktree festival-6 (rama festival-6) en http://localhost:3006
title Festival Niebla - festival-6
cd /d "%~dp0..\..\ClaudeModelFusions-wt\festival-6" || (echo No existe el worktree festival-6 & pause & exit /b 1)
if not exist node_modules call npm install || (pause & exit /b 1)
echo Compilando festival-6...
call npm run build || (echo El build fallo. & pause & exit /b 1)
start "" /min cmd /c "timeout /t 6 >nul & start http://localhost:3006"
call npx next start -p 3006
pause
