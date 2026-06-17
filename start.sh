#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────────────────────
# start.sh — Single entry point to start the Face Styling System
# ─────────────────────────────────────────────────────────────────────────────
set -e

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$PROJECT_ROOT"

echo "✨ AI Personal Stylist - Launch Sequence"
echo "========================================"

# 1. Verification checks
if [ ! -d ".venv" ]; then
  echo "⚠️  Python virtual environment (.venv) not found."
  echo "    Please run 'bash scripts/setup.sh' first to install dependencies."
  exit 1
fi

if [ ! -d "frontend/node_modules" ]; then
  echo "⚠️  Frontend node_modules not found."
  echo "    Please run 'bash scripts/setup.sh' first to install dependencies."
  exit 1
fi

# 2. Clean shutdown handler
cleanup() {
  echo -e "\n🛑 Shutting down gracefully..."
  kill "$BACKEND_PID" "$FRONTEND_PID" 2>/dev/null || true
  wait "$BACKEND_PID" "$FRONTEND_PID" 2>/dev/null || true
  echo "✅ Application stopped."
  exit 0
}

# Trap Ctrl+C (SIGINT) so child processes are cleanly killed
trap cleanup INT TERM

# 3. Start Backend
echo "🚀 Starting FastAPI Backend (Port 8000)..."
source .venv/bin/activate
PYTHONPATH="$PROJECT_ROOT:$PROJECT_ROOT/backend" uvicorn backend.main:app --host 0.0.0.0 --port 8000 --reload &
BACKEND_PID=$!

# 4. Start Frontend
echo "🚀 Starting React Frontend (Port 5173)..."
cd frontend
npm run dev &
FRONTEND_PID=$!
cd ..

echo ""
echo "========================================"
echo "✅ System is live and running!"
echo "🌍 Frontend app: http://localhost:5173"
echo "⚙️  Backend API:  http://localhost:8000/docs"
echo "🛑 Press Ctrl+C to stop everything."
echo "========================================"
echo ""

# 5. Keep script running and wait for child processes
wait "$BACKEND_PID" "$FRONTEND_PID"
