"""
Face detection using OpenCV Haar cascade (no MediaPipe dependency).

Works on all platforms and Python versions supported by OpenCV.
"""
from __future__ import annotations

import logging
from dataclasses import dataclass
from typing import Optional

import cv2
import numpy as np

logger = logging.getLogger(__name__)


@dataclass
class FaceResult:
    detected: bool
    bbox: Optional[tuple[int, int, int, int]] = None  # x, y, w, h (in original image)
    face_crop: Optional[np.ndarray] = None             # BGR crop of face region (with padding)
    # Estimated key points derived from bbox geometry — shape (N, 2) pixel coords.
    # Indices map to logical positions (not MediaPipe indices):
    #   0  = forehead_top    5  = left_jaw
    #   1  = chin_bottom     6  = right_jaw
    #   2  = left_cheek      7  = left_forehead_edge
    #   3  = right_cheek     8  = right_forehead_edge
    #   4  = center_nose
    landmarks: Optional[np.ndarray] = None


# Fraction-based positions within the face bbox used to estimate keypoints
_KP_FRACS = {
    # (x_frac, y_frac) within the tight bbox
    "forehead_top":        (0.50, 0.08),
    "chin_bottom":         (0.50, 0.95),
    "left_cheek":          (0.08, 0.50),
    "right_cheek":         (0.92, 0.50),
    "center_nose":         (0.50, 0.50),
    "left_jaw":            (0.22, 0.80),
    "right_jaw":           (0.78, 0.80),
    "left_forehead_edge":  (0.25, 0.15),
    "right_forehead_edge": (0.75, 0.15),
}


class FaceDetector:
    """
    Detects the largest face in a BGR image using OpenCV Haar cascade.

    Falls back to a second-pass detection with relaxed parameters if
    the first pass finds nothing (useful for profile / tilted faces).
    """

    def __init__(self) -> None:
        # cv2.data.haarcascades is always available in opencv-python(-headless)
        cascade_path = cv2.data.haarcascades + "haarcascade_frontalface_default.xml"
        self._cascade = cv2.CascadeClassifier(cascade_path)
        if self._cascade.empty():
            raise RuntimeError(f"Could not load Haar cascade from {cascade_path}")

    def detect(self, image_bgr: np.ndarray) -> FaceResult:
        """
        Run detection on a BGR image (as returned by cv2.imread / cv2.imdecode).

        Returns a FaceResult; check .detected before accessing other fields.
        """
        gray = cv2.cvtColor(image_bgr, cv2.COLOR_BGR2GRAY)
        # CLAHE improves detection in uneven lighting
        clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8, 8))
        gray = clahe.apply(gray)

        faces = self._cascade.detectMultiScale(
            gray,
            scaleFactor=1.1,
            minNeighbors=5,
            minSize=(60, 60),
            flags=cv2.CASCADE_SCALE_IMAGE,
        )

        # Fallback: relaxed parameters
        if not isinstance(faces, np.ndarray) or len(faces) == 0:
            faces = self._cascade.detectMultiScale(
                gray,
                scaleFactor=1.05,
                minNeighbors=3,
                minSize=(40, 40),
            )

        if not isinstance(faces, np.ndarray) or len(faces) == 0:
            logger.warning("No face detected in image.")
            return FaceResult(detected=False)

        # Pick the largest face (by area)
        x, y, w, h = max(faces, key=lambda r: r[2] * r[3])
        img_h, img_w = image_bgr.shape[:2]

        # Add 10 % padding for colour sampling headroom
        pad_x = int(w * 0.10)
        pad_y = int(h * 0.10)
        x1 = max(0, x - pad_x)
        y1 = max(0, y - pad_y)
        x2 = min(img_w, x + w + pad_x)
        y2 = min(img_h, y + h + pad_y)
        face_crop = image_bgr[y1:y2, x1:x2]

        # Estimate keypoints from tight bbox fractions
        kp_list = []
        for name in (
            "forehead_top", "chin_bottom", "left_cheek", "right_cheek",
            "center_nose", "left_jaw", "right_jaw",
            "left_forehead_edge", "right_forehead_edge",
        ):
            fx, fy = _KP_FRACS[name]
            kp_list.append([int(x + fx * w), int(y + fy * h)])
        landmarks = np.array(kp_list, dtype=np.int32)

        return FaceResult(
            detected=True,
            bbox=(x, y, w, h),
            face_crop=face_crop,
            landmarks=landmarks,
        )

    # Context-manager support (no-op — OpenCV cascade has no state to release)
    def close(self) -> None:
        pass

    def __enter__(self) -> "FaceDetector":
        return self

    def __exit__(self, *_) -> None:
        pass
