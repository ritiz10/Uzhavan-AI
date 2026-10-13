@echo off
echo ========================================================
echo Launching AI Smart Farming Assistant (Backend + Frontend)
echo ========================================================
start "AI Smart Farming - Backend" cmd /k "cd /d %~dp0backend && python -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000"
timeout /t 3 /nobreak >nul
start "AI Smart Farming - Frontend" cmd /k "cd /d %~dp0frontend && npm run dev"
echo Both services launched!
echo - Frontend: http://localhost:5173
echo - Backend:  http://localhost:8000/docs
