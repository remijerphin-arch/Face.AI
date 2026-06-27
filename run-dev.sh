#!/bin/bash
echo "==================================================="
echo "     FaceSense AI - Codespaces & Linux Launcher     "
echo "==================================================="
echo.

# Function to kill child processes on exit
cleanup() {
    echo "Shutting down servers..."
    kill $BACKEND_PID $FRONTEND_PID 2>/dev/null
    exit
}
trap cleanup INT TERM EXIT

# 1. Start FastAPI Backend in background
echo "[1/2] Setting up Python virtual environment and starting FastAPI..."
cd backend
if [ ! -d "venv" ]; then
    python3 -m venv venv
fi
source venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000 &
BACKEND_PID=$!
cd ..

# Wait 2 seconds for backend port bind
sleep 2

# 2. Start Next.js Frontend in background
echo "[2/2] Installing Node packages and starting Next.js..."
cd frontend
npm install --no-audit --no-fund
npm run dev &
FRONTEND_PID=$!
cd ..

echo "---------------------------------------------------"
echo "✓ Both servers are starting up!"
echo "• Backend API: http://localhost:8000"
echo "• Frontend Web App: http://localhost:3000"
echo "Press Ctrl+C to stop both servers."
echo "---------------------------------------------------"

# Keep script running
wait
