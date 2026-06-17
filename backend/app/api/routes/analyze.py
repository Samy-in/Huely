"""
/analyze  — core endpoint.

Accepts a Base64 image + occasion, runs the full ML pipeline,
and returns a structured JSON result.
"""
from __future__ import annotations

import logging

from fastapi import APIRouter, HTTPException, Request, status

from app.core.security import validate_image_b64
from app.models.schemas import AnalyzeRequest, AnalyzeResponse, OutfitsRequest, OutfitsResponse

logger = logging.getLogger(__name__)

router = APIRouter()


@router.post("/analyze", response_model=AnalyzeResponse, tags=["Analysis"])
async def analyze_image(request: Request, body: AnalyzeRequest) -> AnalyzeResponse:
    """
    Run face-based fashion analysis on the submitted image.

    - **image**: Base64-encoded JPEG / PNG / WebP (data URI prefix optional)
    - **occasion**: `Casual` | `Formal` | `Party`
    """
    # Validate and decode image — raises HTTP 400/413 on failure
    raw_bytes = validate_image_b64(body.image)

    # Access the engine singleton stored at app startup
    engine = request.app.state.engine

    from ml.utils.image_utils import bytes_to_bgr, resize_if_large

    try:
        image_bgr = bytes_to_bgr(raw_bytes)
        image_bgr = resize_if_large(image_bgr)
    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(exc),
        )

    try:
        result = engine.analyze(image_bgr, occasion=body.occasion, gender_override=body.gender_override)
    except Exception as exc:
        logger.exception("ML pipeline error: %s", exc)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal analysis error. Please try again.",
        )

    return AnalyzeResponse(**result)


@router.post("/outfits", response_model=OutfitsResponse, tags=["Analysis"])
async def get_outfits(body: OutfitsRequest) -> OutfitsResponse:
    """
    Return only outfit suggestions for a given gender/face_shape/occasion.
    Use this when the user changes occasion tab — avoids re-running the full ML pipeline.
    """
    from ml.recommendation.rules import get_gender_outfit_recommendations

    suggestions = get_gender_outfit_recommendations(
        gender=body.gender,
        face_shape=body.face_shape,
        occasion=body.occasion,
    )
    return OutfitsResponse(outfit_suggestions=suggestions, occasion=body.occasion)
