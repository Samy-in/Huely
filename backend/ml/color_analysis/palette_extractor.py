"""Dominant color palette extraction via K-Means on the face crop."""
from __future__ import annotations

import logging

import cv2
import numpy as np
from sklearn.cluster import KMeans

logger = logging.getLogger(__name__)


class PaletteExtractor:
    """
    Extracts the top N dominant colors from a face crop using K-Means.

    Returns colors as hex strings along with their percentage share.
    """

    def __init__(self, n_colors: int = 5, random_state: int = 42) -> None:
        self.n_colors = n_colors
        self.random_state = random_state

    def extract(self, face_crop_bgr: np.ndarray) -> list[dict]:
        """
        Args:
            face_crop_bgr: BGR numpy array of the face region.

        Returns:
            List of dicts ordered by dominance:
            [{"hex": "#RRGGBB", "rgb": [r, g, b], "percent": float}, ...]
        """
        if face_crop_bgr is None or face_crop_bgr.size == 0:
            return []

        # Resize for speed — 100×100 is plenty for clustering
        small = cv2.resize(face_crop_bgr, (100, 100))
        pixels = small.reshape(-1, 3).astype(np.float32)

        n = min(self.n_colors, len(pixels))
        kmeans = KMeans(n_clusters=n, random_state=self.random_state, n_init=10)
        kmeans.fit(pixels)

        centers = kmeans.cluster_centers_.astype(np.uint8)  # BGR
        labels = kmeans.labels_
        counts = np.bincount(labels, minlength=n)
        total = counts.sum()

        # Sort by dominance descending
        order = np.argsort(-counts)
        palette = []
        for i in order:
            b, g, r = int(centers[i][0]), int(centers[i][1]), int(centers[i][2])
            palette.append({
                "hex": f"#{r:02X}{g:02X}{b:02X}",
                "rgb": [r, g, b],
                "percent": round(float(counts[i]) / total * 100, 1),
            })

        return palette
