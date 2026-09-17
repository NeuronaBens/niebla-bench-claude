@echo off
rem Abre la solucion del worktree festival-9 (rama festival-9) en http://localhost:3009
title Festival Niebla - festival-9
cd /d "%~dp0..\..\ClaudeModelFusions-wt\festival-9" || (echo No existe el worktree festival-9 & pause & exit /b 1)
if not exist node_modules call npm install || (pause & exit /b 1)
echo Compilando festival-9...
call npm run build || (echo El build fallo. & pause & exit /b 1)
start "" /min cmd /c "timeout /t 6 >nul & start http://localhost:3009"
call npx next start -p 3009
pause
