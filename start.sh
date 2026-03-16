#!/bin/bash
# Start Budget Tracker — runs backend + frontend with one command

cd "$(dirname "$0")"

echo "Starting Budget Tracker..."
echo ""

# Start backend in background
echo "[1/2] Starting backend (port 8000)..."
uvicorn backend.main:app --reload --port 8000 &
BACKEND_PID=$!

# Start frontend in background
echo "[2/2] Starting frontend (port 5173)..."
cd frontend
npm run dev &
FRONTEND_PID=$!
cd ..

echo ""
echo "Budget Tracker is running!"
echo "  Open: http://localhost:5173"
echo ""
echo "Press Ctrl+C to stop both servers."

# When user hits Ctrl+C, kill both
trap "kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; echo ''; echo 'Stopped.'; exit 0" INT TERM

# Wait for either to exit
wait
