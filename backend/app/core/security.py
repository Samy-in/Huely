"""Security helpers: CORS configuration and input sanitisation."""
from __future__ import annotations

import base64
import re

from fastapi import HTTPException, status
from fastapi.middleware.cors import CORSMiddleware

from .config import settings

# ─── CORS ─────────────────────────────────────────────────────────────────────

def add_cors(app) -> None:  # type: ignore[type-arg]
    """Attach CORSMiddleware to the FastAPI app."""
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origins_list,
        allow_credentials=False,
        allow_methods=["GET", "POST"],
        allow_headers=["Content-Type", "Accept"],
    )


# ─── Image validation ─────────────────────────────────────────────────────────

_DATA_URI_RE = re.compile(r"^data:image/(jpeg|png|webp);base64,", re.IGNORECASE)
_MAX_B64_LEN = settings.MAX_IMAGE_SIZE * 4 // 3 + 100  # approx B64 overhead


def validate_image_b64(b64_string: str) -> bytes:
    """
    Validate and decode a Base64 image string.

    Returns raw image bytes.
    Raises HTTP 400 on any validation failure.
    """
    if len(b64_string) > _MAX_B64_LEN:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail=f"Image exceeds maximum allowed size ({settings.MAX_IMAGE_SIZE} bytes).",
        )

    # Strip data URI prefix if present
    if "," in b64_string:
        header, b64_data = b64_string.split(",", 1)
        if not _DATA_URI_RE.match(header + ","):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Unsupported image format. Use JPEG, PNG, or WebP.",
            )
    else:
        b64_data = b64_string

    try:
        raw_bytes = base64.b64decode(b64_data, validate=True)
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid Base64 encoding.",
        )

    if len(raw_bytes) > settings.MAX_IMAGE_SIZE:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail="Decoded image exceeds maximum allowed size.",
        )

    return raw_bytes
