@echo off
rem Slate Plaque Studio - launcher for Windows.
rem Double-click this file. Closing the window stops the studio.

cd /d "%~dp0"

set "NODE="

rem Explorer-launched shells sometimes miss PATH entries a terminal has, so
rem check the standard install locations before reporting Node as missing.
where node >nul 2>nul && set "NODE=node"

if not defined NODE if exist "%ProgramFiles%\nodejs\node.exe"      set "NODE=%ProgramFiles%\nodejs\node.exe"
if not defined NODE if exist "%ProgramFiles(x86)%\nodejs\node.exe" set "NODE=%ProgramFiles(x86)%\nodejs\node.exe"
if not defined NODE if exist "%LOCALAPPDATA%\Programs\nodejs\node.exe" set "NODE=%LOCALAPPDATA%\Programs\nodejs\node.exe"
if not defined NODE if exist "%LOCALAPPDATA%\Volta\bin\node.exe"   set "NODE=%LOCALAPPDATA%\Volta\bin\node.exe"
if not defined NODE if exist "%APPDATA%\nvm\node.exe"              set "NODE=%APPDATA%\nvm\node.exe"

if not defined NODE (
  echo.
  echo   Slate Plaque Studio needs Node.js, which does not appear to be installed.
  echo.
  echo   Install the LTS build from  https://nodejs.org
  echo   then double-click this launcher again.
  echo.
  pause
  exit /b 1
)

for /f "delims=" %%V in ('"%NODE%" -p "process.versions.node.split('.')[0]" 2^>nul') do set "MAJOR=%%V"

if not defined MAJOR (
  echo.
  echo   Node.js was found but would not run. Try reinstalling from https://nodejs.org
  echo.
  pause
  exit /b 1
)

if %MAJOR% LSS 18 (
  echo.
  echo   Node.js 18 or newer is required.
  echo   Update it at https://nodejs.org and try again.
  echo.
  pause
  exit /b 1
)

"%NODE%" tools\launch.mjs %*

rem Only lingers if the studio exited on its own - an error worth reading.
if errorlevel 1 pause
