"""
Face shape classification using bbox geometry and face-crop horizontal
width analysis (no MediaPipe / landmark dependency).
"""
from __future__ import annotations

import logging
from typing import TYPE_CHECKING

import cv2
import numpy as np

if TYPE_CHECKING:
    from ..face_detection.detector import FaceResult

logger = logging.getLogger(__name__)


def _face_widths_at_levels(face_crop_bgr: np.ndarray) -> tuple[float, float, float]:
    """
    Estimate relative face width at forehead (20 %), cheek (50 %), jaw (78 %)
    vertical positions within the face crop.

    Returns widths normalised by the image width so they are scale-invariant.
    """
    gray = cv2.cvtColor(face_crop_bgr, cv2.COLOR_BGR2GRAY)
    h, w = gray.shape

    # Adaptive threshold to find skin region
    blurred = cv2.GaussianBlur(gray, (5, 5), 0)
    _, binary = cv2.threshold(blurred, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)

    def row_width_frac(y_frac: float) -> float:
        row = int(h * y_frac)
        row = max(0, min(h - 1, row))
        cols = np.where(binary[row, :] > 128)[0]
        if len(cols) < 2:
            return 1.0  # fallback: assume full width
        return float(cols[-1] - cols[0]) / w

    forehead = row_width_frac(0.20)
    cheek    = row_width_frac(0.50)
    jaw      = row_width_frac(0.78)
    return forehead, cheek, jaw


class FaceShapeClassifier:
    """
    Classifies face shape into: Oval | Round | Square | Oblong | Heart.

    Uses the detected face's bbox aspect ratio combined with a horizontal
    projection analysis of the face crop to estimate relative widths at
    forehead, cheek, and jaw levels.
    """

    def classify(self, face_result: "FaceResult") -> str:
        if not face_result.detected or face_result.bbox is None:
            return "Unknown"

        _, _, w, h = face_result.bbox
        if w < 1:
            return "Unknown"

        face_ratio = h / w  # height-to-width; >1 means taller than wide

        # Fallback if no crop available
        if face_result.face_crop is None or face_result.face_crop.size == 0:
            return self._classify_from_ratio(face_ratio, 0.7, 1.0, 0.7)

        try:
            forehead_w, cheek_w, jaw_w = _face_widths_at_levels(face_result.face_crop)
        except Exception:
            return self._classify_from_ratio(face_ratio, 0.7, 1.0, 0.7)

        logger.debug(
            "face_ratio=%.2f  forehead=%.2f  cheek=%.2f  jaw=%.2f",
            face_ratio, forehead_w, cheek_w, jaw_w,
        )
        return self._classify_from_ratio(face_ratio, forehead_w, cheek_w, jaw_w)

    @staticmethod
    def _classify_from_ratio(
        face_ratio: float,
        forehead_w: float,
        cheek_w: float,
        jaw_w: float,
    ) -> str:
        # Heart: forehead clearly wider than jaw
        if forehead_w > 0 and jaw_w > 0 and (forehead_w - jaw_w) / max(forehead_w, 1e-6) > 0.18:
            return "Heart"

        # Oblong: notably taller than wide
        if face_ratio > 1.60:
            return "Oblong"

        # Square: wide (low ratio) with a wide jaw matching cheek
        if face_ratio < 1.20 and jaw_w >= 0.88 * cheek_w:
            return "Square"

        # Round: nearly as wide as tall, smooth
        if face_ratio < 1.25:
            return "Round"

        # Oval: balanced taller-than-wide proportions
        if 1.25 <= face_ratio <= 1.65:
            return "Oval"

        return "Oval"  # default
