#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────────────────────
# run_dev.sh  — Start the FastAPI backend + Vite frontend concurrently
# Run from the project root:  bash scripts/run_dev.sh
# ─────────────────────────────────────────────────────────────────────────────
set -euo pipefail

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$PROJECT_ROOT"

if [ ! -d ".venv" ]; then
  echo "❌  .venv not found. Run  bash scripts/setup.sh  first."
  exit 1
fi

# shellcheck disable=SC1091
source .venv/bin/activate

# Trap Ctrl+C to kill both child processes cleanly
cleanup() {
  echo ""
  echo "==> Stopping servers…"
  kill "$BACKEND_PID" "$FRONTEND_PID" 2>/dev/null || true
  exit 0
}
trap cleanup INT TERM

# ── Backend ───────────────────────────────────────────────────────────────────
echo "==> Starting FastAPI backend on http://localhost:8000 …"
# PYTHONPATH: project root (for ml/) + backend/ (for app/)
PYTHONPATH="$PROJECT_ROOT:$PROJECT_ROOT/backend" \
  uvicorn backend.main:app \
  --host 0.0.0.0 --port 8000 --reload \
  --reload-dir backend --reload-dir ml &
BACKEND_PID=$!

# ── Frontend ──────────────────────────────────────────────────────────────────
echo "==> Starting Vite frontend on http://localhost:5173 …"
cd frontend
npm run dev &
FRONTEND_PID=$!
cd ..

echo ""
echo "🚀  Both servers running."
echo "    Backend  → http://localhost:8000/docs"
echo "    Frontend → http://localhost:5173"
echo "    Press Ctrl+C to stop."
echo ""

wait
