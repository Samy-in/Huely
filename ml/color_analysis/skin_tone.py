"""
Skin tone detection via face-crop region sampling in LAB color space.
Works entirely from the face bounding-box crop (no MediaPipe landmarks).
"""
from __future__ import annotations

import logging
from typing import TYPE_CHECKING

import cv2
import numpy as np

if TYPE_CHECKING:
    from ..face_detection.detector import FaceResult

logger = logging.getLogger(__name__)

# ITA (Individual Typology Angle) thresholds — standard dermatology scale
_ITA_VERY_LIGHT = 55.0
_ITA_LIGHT      = 41.0
_ITA_MEDIUM     = 28.0
_ITA_TAN        = 10.0
_ITA_BROWN      = -30.0

# Sampling regions as (x_frac, y_frac, half_size_frac) within the face crop
# Cheek areas: left and right, midway vertically
_SAMPLE_REGIONS = [
    (0.22, 0.50),  # left cheek
    (0.78, 0.50),  # right cheek
    (0.50, 0.30),  # forehead centre
    (0.50, 0.65),  # nose bridge / mid-face
]
_PATCH_FRAC = 0.06  # patch half-size as fraction of crop dimension


def _ita_angle(L: float, b: float) -> float:
    """Individual Typology Angle from CIE-LAB L* and b* channels."""
    return float(np.degrees(np.arctan((L - 50.0) / (b + 1e-6))))


class SkinToneDetector:
    """
    Detects skin tone category from cheek/forehead regions of the face crop.

    Returns one of: Very Light | Light | Medium | Tan | Brown | Dark
    """

    def detect(self, image_bgr: np.ndarray, face_result: "FaceResult") -> dict:
        """
        Returns:
            {"tone": str, "lab_mean": [L, a, b], "ita": float}
        """
        if not face_result.detected or face_result.face_crop is None:
            return {"tone": "Unknown", "lab_mean": [], "ita": 0.0}

        crop = face_result.face_crop
        ch, cw = crop.shape[:2]
        lab_crop = cv2.cvtColor(crop, cv2.COLOR_BGR2LAB)

        samples: list[np.ndarray] = []
        patch_h = max(4, int(ch * _PATCH_FRAC))
        patch_w = max(4, int(cw * _PATCH_FRAC))

        for xf, yf in _SAMPLE_REGIONS:
            cx = int(cw * xf)
            cy = int(ch * yf)
            y0 = max(0, cy - patch_h)
            y1 = min(ch, cy + patch_h)
            x0 = max(0, cx - patch_w)
            x1 = min(cw, cx + patch_w)
            patch = lab_crop[y0:y1, x0:x1]
            if patch.size > 0:
                samples.append(patch.reshape(-1, 3).astype(np.float32))

        if not samples:
            return {"tone": "Unknown", "lab_mean": [], "ita": 0.0}

        all_pixels = np.vstack(samples)
        lab_mean = all_pixels.mean(axis=0)  # [L, a, b] in OpenCV scale

        # OpenCV LAB: L ∈ [0, 255], a/b ∈ [0, 255] (128 = neutral)
        L_norm = (lab_mean[0] / 255.0) * 100.0   # → [0, 100]
        b_norm = float(lab_mean[2]) - 128.0       # → [-128, 127]

        ita = _ita_angle(L_norm, b_norm)

        if   ita > _ITA_VERY_LIGHT: tone = "Very Light"
        elif ita > _ITA_LIGHT:      tone = "Light"
        elif ita > _ITA_MEDIUM:     tone = "Medium"
        elif ita > _ITA_TAN:        tone = "Tan"
        elif ita > _ITA_BROWN:      tone = "Brown"
        else:                       tone = "Dark"

        logger.debug("ITA=%.1f → tone=%s", ita, tone)

        return {
            "tone": tone,
            "lab_mean": lab_mean.tolist(),
            "ita": round(ita, 2),
        }
