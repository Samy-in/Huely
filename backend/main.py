"""
FastAPI application entry point.

Run with:
    uvicorn main:app --reload --host 0.0.0.0 --port 8000
"""
from __future__ import annotations

import logging
import sys
import os

_HERE = os.path.dirname(os.path.abspath(__file__))
_ROOT = os.path.dirname(_HERE)

# backend/ itself must be on sys.path so `app` package is importable
# Project root must be on sys.path so `ml` package is importable
for _p in (_HERE, _ROOT):
    if _p not in sys.path:
        sys.path.insert(0, _p)

from contextlib import asynccontextmanager

from fastapi import FastAPI

from app.api import api_router
from app.core.config import settings
from app.core.security import add_cors

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s  %(levelname)-8s  %(name)s — %(message)s",
)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Initialise the ML engine once at startup; clean up on shutdown."""
    logger.info("Loading ML pipeline…")
    from ml.recommendation.engine import RecommendationEngine
    app.state.engine = RecommendationEngine()
    logger.info("ML pipeline ready.")
    # Pre-warm DeepFace so model weights are cached before the first request.
    # This may take 30-120 s on first run (downloads ~500 MB VGG-Face weights);
    # subsequent starts are instant (weights already on disk).
    import asyncio
    loop = asyncio.get_event_loop()
    await loop.run_in_executor(
        None, app.state.engine._gender_clf.warmup
    )
    yield
    logger.info("Shutting down ML pipeline…")
    app.state.engine.close()


app = FastAPI(
    title="Face-Based AI Personal Styling API",
    description="Analyse a face image and receive personalised fashion recommendations.",
    version=settings.APP_VERSION,
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc",
)

add_cors(app)
app.include_router(api_router)


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host=settings.BACKEND_HOST,
        port=settings.BACKEND_PORT,
        reload=settings.BACKEND_RELOAD,
    )
