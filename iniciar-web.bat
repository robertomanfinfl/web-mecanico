@echo off
setlocal
cd /d "%~dp0"
where node.exe >nul 2>&1
if not errorlevel 1 (
  set "WORKSHOP_NODE=node.exe"
  goto run
)
set "PATH=%SystemRoot%\System32\WindowsPowerShell\v1.0;%PATH%"
for /f "usebackq delims=" %%P in (`powershell.exe -NoProfile -Command "(Get-AppxPackage -Name 'OpenAI.CodexPrimaryRuntime*' | Sort-Object Version -Descending | Select-Object -First 1).InstallLocation"`) do (
  if exist "%%P\dependencies\node\bin\node.exe" set "WORKSHOP_NODE=%%P\dependencies\node\bin\node.exe"
)
if not defined WORKSHOP_NODE (
  echo Instala Node.js 24 para usar la aplicacion del taller.
  pause
  exit /b 1
)
:run
"%WORKSHOP_NODE%" --env-file-if-exists=.env scripts\iniciar-web.mjs
if errorlevel 1 (
  echo.
  pause
  exit /b 1
)
