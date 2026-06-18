"""
Undertone detection: Warm / Cool / Neutral.
Samples from face-crop regions by fraction (no MediaPipe landmarks).
"""
from __future__ import annotations

import logging
from typing import TYPE_CHECKING

import cv2
import numpy as np

if TYPE_CHECKING:
    from ..face_detection.detector import FaceResult

logger = logging.getLogger(__name__)

# Sampling regions (x_frac, y_frac) — same as skin tone but also includes
# forehead and nose to get a fuller picture of the a*/b* bias
_SAMPLE_REGIONS = [
    (0.20, 0.50),   # left cheek
    (0.80, 0.50),   # right cheek
    (0.50, 0.22),   # forehead centre
    (0.50, 0.40),   # nose / mid-face
    (0.35, 0.60),   # left nasolabial
    (0.65, 0.60),   # right nasolabial
]
_PATCH_FRAC = 0.06


class UndertoneDetector:
    """
    Determines undertone by analysing a* and b* channels of CIE-LAB samples.

    Logic
    -----
    In CIE-LAB (OpenCV scale, centred at 128):
      a* > 128 → red/magenta shift  (warm contributor)
      b* > 128 → yellow shift       (warm contributor)
      b* < 128 → blue shift         (cool contributor)

    Warm    : b* clearly above neutral (yellow-peach)
    Cool    : a* above neutral AND b* near or below neutral (pink-blue)
    Neutral : neither dominates
    """

    def detect(self, image_bgr: np.ndarray, face_result: "FaceResult") -> dict:
        """
        Returns:
            {"undertone": str, "a_mean": float, "b_mean": float}
        """
        if not face_result.detected or face_result.face_crop is None:
            return {"undertone": "Unknown", "a_mean": 0.0, "b_mean": 0.0}

        crop = face_result.face_crop
        ch, cw = crop.shape[:2]
        lab = cv2.cvtColor(crop, cv2.COLOR_BGR2LAB).astype(np.float32)

        samples: list[np.ndarray] = []
        patch_h = max(4, int(ch * _PATCH_FRAC))
        patch_w = max(4, int(cw * _PATCH_FRAC))

        for xf, yf in _SAMPLE_REGIONS:
            cx = int(cw * xf)
            cy = int(ch * yf)
            y0, y1 = max(0, cy - patch_h), min(ch, cy + patch_h)
            x0, x1 = max(0, cx - patch_w), min(cw, cx + patch_w)
            patch = lab[y0:y1, x0:x1]
            if patch.size > 0:
                samples.append(patch.reshape(-1, 3))

        if not samples:
            return {"undertone": "Unknown", "a_mean": 0.0, "b_mean": 0.0}

        all_pix = np.vstack(samples)
        mean_lab = all_pix.mean(axis=0)

        # Normalise: OpenCV a/b both centred at 128
        a_norm = float(mean_lab[1]) - 128.0  # [-128, 127]
        b_norm = float(mean_lab[2]) - 128.0  # [-128, 127]

        logger.debug("a_norm=%.2f  b_norm=%.2f", a_norm, b_norm)

        if b_norm > 8.0:
            undertone = "Warm"
        elif a_norm > 5.0 and b_norm < 5.0:
            undertone = "Cool"
        else:
            undertone = "Neutral"

        return {
            "undertone": undertone,
            "a_mean": round(a_norm, 2),
            "b_mean": round(b_norm, 2),
        }
