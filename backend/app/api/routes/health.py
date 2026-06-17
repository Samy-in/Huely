"""Health-check endpoint."""
from fastapi import APIRouter
from app.models.schemas import HealthResponse
from app.core.config import settings

router = APIRouter()


@router.get("/health", response_model=HealthResponse, tags=["Meta"])
async def health_check() -> HealthResponse:
    return HealthResponse(status="ok", version=settings.APP_VERSION)
