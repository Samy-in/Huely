"""Image utility helpers shared across ML modules."""
from __future__ import annotations

import base64
import io
import logging

import cv2
import numpy as np
from PIL import Image

logger = logging.getLogger(__name__)

SUPPORTED_FORMATS = {"image/jpeg", "image/png", "image/webp"}
MAX_DIMENSION = 1280  # longest side cap for performance


def base64_to_bgr(data_uri_or_b64: str) -> np.ndarray:
    """
    Convert a Base64 string (with or without data URI prefix) to a BGR ndarray.

    Raises
    ------
    ValueError if the string is not valid Base64 image data.
    """
    if "," in data_uri_or_b64:
        _, b64_data = data_uri_or_b64.split(",", 1)
    else:
        b64_data = data_uri_or_b64

    try:
        raw = base64.b64decode(b64_data)
    except Exception as exc:
        raise ValueError(f"Invalid Base64 data: {exc}") from exc

    return bytes_to_bgr(raw)


def bytes_to_bgr(raw_bytes: bytes) -> np.ndarray:
    """Decode raw image bytes to a BGR ndarray via OpenCV."""
    arr = np.frombuffer(raw_bytes, dtype=np.uint8)
    img = cv2.imdecode(arr, cv2.IMREAD_COLOR)
    if img is None:
        raise ValueError("Could not decode image bytes — unsupported format or corrupt data.")
    return img


def resize_if_large(image_bgr: np.ndarray, max_dim: int = MAX_DIMENSION) -> np.ndarray:
    """Downscale image so the longest side is ≤ max_dim, preserving aspect ratio."""
    h, w = image_bgr.shape[:2]
    longest = max(h, w)
    if longest <= max_dim:
        return image_bgr
    scale = max_dim / longest
    new_w = max(1, int(w * scale))
    new_h = max(1, int(h * scale))
    return cv2.resize(image_bgr, (new_w, new_h), interpolation=cv2.INTER_AREA)


def bgr_to_base64(image_bgr: np.ndarray, fmt: str = ".jpg") -> str:
    """Encode a BGR ndarray to a Base64 JPEG/PNG string (no data URI prefix)."""
    success, buf = cv2.imencode(fmt, image_bgr)
    if not success:
        raise RuntimeError("cv2.imencode failed.")
    return base64.b64encode(buf.tobytes()).decode("utf-8")
