#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────────────────────
# setup.sh  — One-time environment setup for the Face-Based AI Styling System
# Run from the project root:  bash scripts/setup.sh
# ─────────────────────────────────────────────────────────────────────────────
set -euo pipefail

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$PROJECT_ROOT"

echo "==> Project root: $PROJECT_ROOT"

# ── 1. Python virtual environment ────────────────────────────────────────────
# MediaPipe requires Python 3.8–3.12; prefer python3.12 if available
PYTHON_BIN="python3.12"
if ! command -v "$PYTHON_BIN" &>/dev/null; then
  PYTHON_BIN="python3"
fi
echo "==> Using Python: $($PYTHON_BIN --version)"

if [ ! -d ".venv" ]; then
  echo "==> Creating Python virtual environment (.venv)…"
  "$PYTHON_BIN" -m venv .venv
fi

echo "==> Activating virtual environment…"
# shellcheck disable=SC1091
source .venv/bin/activate

echo "==> Upgrading pip…"
pip install --upgrade pip -q

echo "==> Installing Python dependencies from backend/requirements.txt…"
pip install -r backend/requirements.txt

# ── 2. Copy .env if not present ───────────────────────────────────────────────
if [ ! -f ".env" ]; then
  echo "==> Copying .env.example → .env"
  cp .env.example .env
fi

# ── 3. Node dependencies ──────────────────────────────────────────────────────
echo "==> Installing Node.js dependencies in frontend/…"
cd frontend
npm install
cd ..

echo ""
echo "✅  Setup complete!"
echo ""
echo "    To start development servers run:"
echo "      bash scripts/run_dev.sh"
echo ""
echo "    Or manually:"
echo "      source .venv/bin/activate"
echo "      uvicorn backend.main:app --reload   (terminal 1)"
echo "      cd frontend && npm run dev          (terminal 2)"
