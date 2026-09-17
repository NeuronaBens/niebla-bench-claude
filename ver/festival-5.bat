@echo off
rem Abre la solucion del worktree festival-5 (rama festival-5) en http://localhost:3005
title Festival Niebla - festival-5
cd /d "%~dp0..\..\ClaudeModelFusions-wt\festival-5" || (echo No existe el worktree festival-5 & pause & exit /b 1)
if not exist node_modules call npm install || (pause & exit /b 1)
echo Compilando festival-5...
call npm run build || (echo El build fallo. & pause & exit /b 1)
start "" /min cmd /c "timeout /t 6 >nul & start http://localhost:3005"
call npx next start -p 3005
pause
