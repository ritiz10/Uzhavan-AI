@echo off
title AI Smart Farming - Backend API (Port 8000)
cd /d "%~dp0backend"
echo ========================================================
echo Starting FastAPI Backend on http://127.0.0.1:8000
echo Swagger API Docs: http://127.0.0.1:8000/docs
echo ========================================================
python -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
pause
