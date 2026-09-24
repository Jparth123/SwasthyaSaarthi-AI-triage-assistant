@echo off
title SwasthyaSaarthi Launcher
echo ========================================================
echo Starting SwasthyaSaarthi (Backend + Frontend)
echo ========================================================

set CURRENT_DIR=%~dp0

if exist "%CURRENT_DIR%swasthyasaarthi\backend" (
    set "BACKEND_DIR=%CURRENT_DIR%swasthyasaarthi\backend"
    set "FRONTEND_DIR=%CURRENT_DIR%swasthyasaarthi\frontend"
) else if exist "%CURRENT_DIR%backend" (
    set "BACKEND_DIR=%CURRENT_DIR%backend"
    set "FRONTEND_DIR=%CURRENT_DIR%frontend"
) else (
    echo [ERROR] Could not find backend and frontend directories!
    pause
    exit /b 1
)

:: 1. Launch Backend (FastAPI)
start "SwasthyaSaarthi Backend (Port 8000)" cmd /k "cd /d ""%BACKEND_DIR%"" && python -m uvicorn main:app --reload --port 8000"

:: 2. Launch Frontend (Vite)
start "SwasthyaSaarthi Frontend (Port 5173)" cmd /k "cd /d ""%FRONTEND_DIR%"" && npm run dev"

echo.
echo Both servers have been launched in separate windows!
echo Backend API Docs: http://localhost:8000/docs
echo Frontend Web App: http://localhost:5173
echo.
pause
