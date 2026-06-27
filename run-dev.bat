@echo off
title FaceSense AI Orchestrator
echo ===================================================
echo             FaceSense AI Launcher
echo ===================================================
echo.
echo [System Detection] Checking dependencies...

:: Check Node.js
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Node.js is not installed. Please install Node.js (v18+) to run the frontend.
    pause
    exit /b 1
)

:: Check Python
where python >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Python is not installed. Please install Python (v3.9+) to run the AI engine.
    pause
    exit /b 1
)

echo [System Detection] Node.js and Python detected successfully.
echo.

:: Start FastAPI Backend in new window
echo [1/2] Launching FastAPI Backend on http://127.0.0.1:8000...
echo      (This will automatically build a Python virtual environment and install packages)
start "FaceSense AI Backend Service" cmd /k "echo Starting Backend Service... && cd backend && if not exist venv ( echo Creating virtual environment... && python -m venv venv ) && call venv\Scripts\activate && echo Installing dependencies... && pip install -r requirements.txt && echo Launching FastAPI dev server... && uvicorn main:app --reload --port 8000"

:: Start Next.js Frontend
echo [2/2] Launching Next.js Frontend on http://localhost:3000...
cd frontend
echo Running npm run dev...
npm run dev
