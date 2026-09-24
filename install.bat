@echo off
title SwasthyaSaarthi Installer
echo ========================================================
echo Installing SwasthyaSaarthi Dependencies (Backend + Frontend)
echo ========================================================

set CURRENT_DIR=%~dp0

if exist "%CURRENT_DIR%swasthyasaarthi\requirements.txt" (
    set "REQ_FILE=%CURRENT_DIR%swasthyasaarthi\requirements.txt"
    set "FRONTEND_DIR=%CURRENT_DIR%swasthyasaarthi\frontend"
) else if exist "%CURRENT_DIR%requirements.txt" (
    set "REQ_FILE=%CURRENT_DIR%requirements.txt"
    set "FRONTEND_DIR=%CURRENT_DIR%frontend"
) else (
    echo [ERROR] Could not find requirements.txt or frontend folder!
    pause
    exit /b 1
)

echo.
echo [1/2] Installing Python backend packages...
python -m pip install --upgrade pip
pip install -r "%REQ_FILE%"
if %errorlevel% neq 0 (
    echo [ERROR] Failed to install Python dependencies.
    pause
    exit /b %errorlevel%
)

echo.
echo [2/2] Installing Node.js frontend packages...
cd /d "%FRONTEND_DIR%"
call npm install
if %errorlevel% neq 0 (
    echo [ERROR] Failed to install npm dependencies.
    pause
    exit /b %errorlevel%
)

echo.
echo ========================================================
echo Installation completed successfully!
echo You can now run the app using run-all.bat
echo ========================================================
pause
