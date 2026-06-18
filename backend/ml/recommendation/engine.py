"""
Recommendation Engine — orchestrates all ML modules and returns
a structured result dict ready for the API response.
"""
from __future__ import annotations

import logging
from typing import Any

import cv2
import numpy as np

from ..face_detection.detector import FaceDetector, FaceResult
from ..face_shape.classifier import FaceShapeClassifier
from ..color_analysis.skin_tone import SkinToneDetector
from ..color_analysis.undertone import UndertoneDetector
from ..color_analysis.palette_extractor import PaletteExtractor
from ..gender_classifier.classifier import GenderClassifier
from .rules import (
    get_color_recommendations,
    get_gender_outfit_recommendations,
    get_style_tips,
)
from .scorer import score_colors

logger = logging.getLogger(__name__)


class RecommendationEngine:
    """
    Single entry-point for the full analysis pipeline.

    Usage
    -----
    engine = RecommendationEngine()
    result = engine.analyze(image_bgr, occasion="Casual")
    """

    def __init__(self) -> None:
        self._detector = FaceDetector()
        self._shape_clf = FaceShapeClassifier()
        self._skin_detector = SkinToneDetector()
        self._undertone_detector = UndertoneDetector()
        self._palette_extractor = PaletteExtractor(n_colors=5)
        self._gender_clf = GenderClassifier()

    def analyze(
        self,
        image_bgr: np.ndarray,
        occasion: str = "Casual",
        gender_override: str | None = None,
    ) -> dict[str, Any]:
        """
        Run the full pipeline on a BGR image.

        Returns
        -------
        {
          "face_detected": bool,
          "face_shape": str,
          "skin_tone": str,
          "undertone": str,
          "ita": float,
          "palette": [{"hex": str, "rgb": list, "percent": float}],
          "recommended_colors": [str],
          "outfit_suggestions": [str],
          "style_tips": [str],
          "color_scores": {color_name: score},
          "occasion": str,
        }
        """
        # ── 1. Face detection ──────────────────────────────────────────
        face: FaceResult = self._detector.detect(image_bgr)

        if not face.detected:
            return {
                "face_detected": False,
                "face_shape": None,
                "skin_tone": None,
                "undertone": None,
                "gender": None,
                "gender_confidence": None,
                "ita": None,
                "palette": [],
                "recommended_colors": [],
                "outfit_suggestions": [],
                "style_tips": [],
                "color_scores": {},
                "occasion": occasion,
            }

        # ── 2. Face shape ──────────────────────────────────────────────
        face_shape = self._shape_clf.classify(face)

        # ── 2b. Gender detection ───────────────────────────────────────
        if gender_override in ("Male", "Female"):
            gender = gender_override
            gender_confidence = 1.0
        else:
            g_result = self._gender_clf.classify(face, face_shape)
            gender = g_result["gender"]
            gender_confidence = g_result["confidence"]

        # ── 3. Skin tone (samples from face_result.face_crop) ─────────
        skin_result = self._skin_detector.detect(image_bgr, face)
        skin_tone: str = skin_result["tone"]
        lab_mean: list = skin_result["lab_mean"]
        ita: float = skin_result["ita"]

        # ── 4. Undertone (samples from face_result.face_crop) ─────────
        undertone_result = self._undertone_detector.detect(image_bgr, face)
        undertone: str = undertone_result["undertone"]

        # ── 5. Color palette ───────────────────────────────────────────
        palette = self._palette_extractor.extract(face.face_crop)

        # ── 6. Recommendations ─────────────────────────────────────────
        recommended_colors = get_color_recommendations(undertone, occasion)
        outfit_suggestions = get_gender_outfit_recommendations(gender, face_shape, occasion)
        style_tips = get_style_tips(skin_tone)

        # ── 7. Color suitability scores ────────────────────────────────
        # Use the mean RGB of the dominant palette color as skin reference
        if lab_mean:
            # Convert LAB mean back to approx BGR then to RGB
            lab_pixel = np.array([[lab_mean]], dtype=np.uint8)
            bgr_pixel = cv2.cvtColor(lab_pixel, cv2.COLOR_LAB2BGR)
            b, g, r = int(bgr_pixel[0, 0, 0]), int(bgr_pixel[0, 0, 1]), int(bgr_pixel[0, 0, 2])
            skin_rgb = [r, g, b]
        else:
            skin_rgb = [200, 170, 140]  # fallback neutral

        color_scores = score_colors(skin_rgb, recommended_colors)

        return {
            "face_detected": True,
            "face_shape": face_shape,
            "skin_tone": skin_tone,
            "undertone": undertone,
            "gender": gender,
            "gender_confidence": round(gender_confidence, 2),
            "ita": ita,
            "palette": palette,
            "recommended_colors": recommended_colors,
            "outfit_suggestions": outfit_suggestions,
            "style_tips": style_tips,
            "color_scores": color_scores,
            "occasion": occasion,
        }

    def close(self) -> None:
        self._detector.close()

    def __enter__(self) -> "RecommendationEngine":
        return self

    def __exit__(self, *_) -> None:
        self.close()
