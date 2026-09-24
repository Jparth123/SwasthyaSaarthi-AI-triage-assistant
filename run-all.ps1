# SwasthyaSaarthi PowerShell Launcher
$backendPath = Join-Path $PSScriptRoot "swasthyasaarthi\backend"
$frontendPath = Join-Path $PSScriptRoot "swasthyasaarthi\frontend"

Write-Host "========================================================" -ForegroundColor Cyan
Write-Host "Starting SwasthyaSaarthi (Backend + Frontend)..." -ForegroundColor Green
Write-Host "========================================================" -ForegroundColor Cyan

# Start Backend
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location '$backendPath'; Write-Host 'Starting FastAPI Backend on port 8000...' -ForegroundColor Cyan; python -m uvicorn main:app --reload --port 8000"

# Start Frontend
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location '$frontendPath'; Write-Host 'Starting Vite Frontend on port 5173...' -ForegroundColor Green; npm run dev"

Write-Host "Backend URL:  http://localhost:8000" -ForegroundColor Cyan
Write-Host "Frontend URL: http://localhost:5173" -ForegroundColor Green
Write-Host "Both processes opened in separate windows!" -ForegroundColor Yellow
