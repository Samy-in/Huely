"""
Gender classification — DeepFace (primary) → Levi-Hassner DNN (fallback) → heuristic.

DeepFace uses ArcFace / VGG-Face backends trained on millions of diverse faces
(~95%+ accuracy across all skin tones and demographics).
Falls back to the Caffe DNN + texture heuristic when DeepFace is unavailable.
"""
from __future__ import annotations

import logging
import urllib.request
from pathlib import Path
from typing import TYPE_CHECKING

import cv2
import numpy as np

if TYPE_CHECKING:
    from ..face_detection.detector import FaceResult

logger = logging.getLogger(__name__)

_HERE = Path(__file__).parent

# ── Check DeepFace availability ───────────────────────────────────────────────
_DEEPFACE_AVAILABLE = False
try:
    import deepface  # noqa: F401 — just check importability
    _DEEPFACE_AVAILABLE = True
    logger.info("DeepFace available — will use as primary gender classifier.")
except ImportError:
    logger.info("DeepFace not installed — using Levi-Hassner DNN + heuristic.")

# ── Levi-Hassner DNN fallback URLs ────────────────────────────────────────────
_PROTO_URLS = [
    "https://raw.githubusercontent.com/smahesh29/Gender-and-Age-Detection/master/gender_deploy.prototxt",
]
_MODEL_URLS = [
    "https://raw.githubusercontent.com/smahesh29/Gender-and-Age-Detection/master/gender_net.caffemodel",
]

_PROTO_PATH = _HERE / "gender_deploy.prototxt"
_MODEL_PATH = _HERE / "gender_net.caffemodel"


def _download(urls: list, dest: Path, min_size: int = 100) -> bool:
    """Try each URL in order; return True on success."""
    if dest.exists() and dest.stat().st_size > min_size:
        return True
    tmp = dest.with_suffix(".tmp")
    for url in urls:
        try:
            req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
            with urllib.request.urlopen(req, timeout=60) as r:
                tmp.write_bytes(r.read())
            if tmp.stat().st_size > min_size:
                tmp.rename(dest)
                logger.info("Downloaded: %s", dest.name)
                return True
        except Exception as exc:
            logger.warning("Download failed (%s): %s", url[:60], exc)
        if tmp.exists():
            tmp.unlink(missing_ok=True)
    return False


def _ensure_proto() -> None:
    """Download prototxt if not already present."""
    if _PROTO_PATH.exists() and _PROTO_PATH.stat().st_size > 100:
        return
    _download(_PROTO_URLS, _PROTO_PATH, min_size=100)


def _download_model() -> bool:
    return _download(_MODEL_URLS, _MODEL_PATH, min_size=1_000_000)


class GenderClassifier:
    """
    Runs the Levi-Hassner DNN gender classifier when the caffemodel is
    available. Falls back to a multi-factor heuristic otherwise.
    """

    # Adience mean pixel (BGR) used during training
    _MEAN = (78.4263377603, 87.7689143744, 114.895847746)
    _LABELS = ["Male", "Female"]   # class 0 = Male, class 1 = Female

    def __init__(self) -> None:
        self._net = None
        if not _DEEPFACE_AVAILABLE:
            self._load_net()

    # ── DeepFace (primary — ArcFace/VGG-Face, ~95% accuracy) ─────────────────

    def _deepface_predict(self, face_bgr: np.ndarray) -> "dict | None":
        """Run DeepFace gender analysis. Returns None on any failure."""
        if not _DEEPFACE_AVAILABLE:
            return None
        try:
            from deepface import DeepFace
            # Pass numpy array directly — no temp file I/O needed
            img_rgb = cv2.cvtColor(face_bgr, cv2.COLOR_BGR2RGB)
            analysis = DeepFace.analyze(
                img_path=img_rgb,
                actions=["gender"],
                enforce_detection=False,
                silent=True,
            )
            if isinstance(analysis, list):
                analysis = analysis[0]
            gender_scores = analysis.get("gender", {})
            # DeepFace returns {"Man": float%, "Woman": float%}
            man_pct   = float(gender_scores.get("Man",   gender_scores.get("Male",   50.0)))
            woman_pct = float(gender_scores.get("Woman", gender_scores.get("Female", 50.0)))
            if man_pct >= woman_pct:
                return {"gender": "Male",   "confidence": round(man_pct   / 100.0, 3)}
            else:
                return {"gender": "Female", "confidence": round(woman_pct / 100.0, 3)}
        except Exception as exc:
            logger.warning("DeepFace error: %s", exc)
            return None

    def warmup(self) -> None:
        """
        Pre-load DeepFace model weights at startup.
        Called once during app lifespan so the first real request is fast.
        """
        if not _DEEPFACE_AVAILABLE:
            return
        try:
            from deepface import DeepFace
            logger.info("Pre-warming DeepFace gender model (downloading weights if needed)…")
            # 48×48 neutral-grey face — enough to trigger model load/cache
            dummy = np.full((48, 48, 3), 128, dtype=np.uint8)
            DeepFace.analyze(
                img_path=dummy,
                actions=["gender"],
                enforce_detection=False,
                silent=True,
            )
            logger.info("DeepFace gender model ready.")
        except Exception as exc:
            logger.warning("DeepFace warmup failed (will retry on first request): %s", exc)

    # ── Private ───────────────────────────────────────────────────────────────

    def _load_net(self) -> None:
        """Try to load the Levi-Hassner DNN. Downloads model if needed."""
        _ensure_proto()
        if not (_MODEL_PATH.exists() and _MODEL_PATH.stat().st_size > 1_000_000):
            ok = _download_model()
            if not ok:
                logger.warning("Using heuristic gender classifier (no DNN model).")
                return
        try:
            self._net = cv2.dnn.readNetFromCaffe(str(_PROTO_PATH), str(_MODEL_PATH))
            logger.info("Levi-Hassner gender DNN loaded.")
        except Exception as exc:
            logger.warning("Failed to load gender DNN: %s. Using heuristic.", exc)
            self._net = None

    def _dnn_predict(self, face_bgr: np.ndarray) -> dict | None:
        """Run the DNN on a face crop. Returns None on failure."""
        if self._net is None:
            return None
        try:
            # Resize to 227×227 (model input) and subtract training mean
            blob = cv2.dnn.blobFromImage(
                face_bgr, 1.0, (227, 227), self._MEAN, swapRB=False
            )
            self._net.setInput(blob)
            out = self._net.forward()          # shape (1, 2)
            probs = out[0]                     # [male_prob, female_prob]
            idx = int(np.argmax(probs))
            confidence = float(probs[idx])
            return {"gender": self._LABELS[idx], "confidence": confidence}
        except Exception as exc:
            logger.warning("DNN inference error: %s", exc)
            return None

    # ── Heuristic ─────────────────────────────────────────────────────────────

    @staticmethod
    def _dark_pixel_ratio(region_bgr: np.ndarray, face_v_mean: float) -> float:
        """
        Fraction of pixels that are significantly darker than the face average.
        Works reliably on all skin tones — beard/stubble = dark relative to face.
        Uses HSV Value channel so skin tone doesn't affect the threshold.
        """
        if region_bgr.size < 30:
            return 0.0
        hsv = cv2.cvtColor(region_bgr, cv2.COLOR_BGR2HSV)
        v   = hsv[:, :, 2].astype(np.float32)
        # pixels at least 18% darker than average face brightness
        threshold = max(0.0, face_v_mean - face_v_mean * 0.18)
        return float(np.mean(v < threshold))

    @staticmethod
    def _laplacian_variance(gray_region: np.ndarray) -> float:
        """High-frequency texture energy — beard/stubble creates micro-texture."""
        if gray_region.size < 30:
            return 0.0
        lap = cv2.Laplacian(gray_region.astype(np.uint8), cv2.CV_64F)
        return float(lap.var())

    def _heuristic_predict(
        self,
        face_result: "FaceResult",
        face_shape: str,
    ) -> dict:
        """
        Multi-factor physical heuristic.
        Key design: all skin-tone-invariant — uses relative darkness and texture
        rather than absolute brightness (fixes failures on dark skin).
        """
        crop = face_result.face_crop
        h, w = crop.shape[:2]
        gray = cv2.cvtColor(crop, cv2.COLOR_BGR2GRAY).astype(np.float32)

        # Face-level HSV value mean (used as adaptive threshold for dark-pixel ratio)
        hsv_face      = cv2.cvtColor(crop, cv2.COLOR_BGR2HSV)
        face_v_mean   = float(hsv_face[:, :, 2].mean())

        male_score = 0.0
        total_w    = 0.0

        # ── Factor 1: Aspect ratio — males have wider faces (weight 1.0) ─────
        if face_result.bbox is not None:
            _, _, bw, bh = face_result.bbox
            ratio = bw / max(float(bh), 1.0)
            wt = 1.0
            if ratio > 0.82:   male_score += wt
            elif ratio > 0.78: male_score += wt * 0.72
            elif ratio > 0.74: male_score += wt * 0.42
            else:              male_score += wt * 0.10
            total_w += wt

        # ── Factor 2: Beard / stubble texture (Laplacian variance) ───────────
        # Beard creates high-frequency micro-texture regardless of skin tone.
        chin_bgr = crop[int(h*0.65):int(h*0.88), int(w*0.22):int(w*0.78)]
        cheek_bgr= crop[int(h*0.36):int(h*0.58), int(w*0.04):int(w*0.28)]
        chin_gray  = gray[int(h*0.65):int(h*0.88), int(w*0.22):int(w*0.78)]
        cheek_gray = gray[int(h*0.36):int(h*0.58), int(w*0.04):int(w*0.28)]
        if chin_gray.size > 20 and cheek_gray.size > 20:
            wt          = 3.0
            chin_tex    = self._laplacian_variance(chin_gray)
            cheek_tex   = self._laplacian_variance(cheek_gray)
            tex_ratio   = chin_tex / max(cheek_tex, 1.0)
            # Beard texture is typically 1.5–4× higher than smooth cheek texture
            if tex_ratio > 2.5:   male_score += wt
            elif tex_ratio > 1.8: male_score += wt * 0.80
            elif tex_ratio > 1.3: male_score += wt * 0.55
            elif tex_ratio > 1.0: male_score += wt * 0.30
            else:                 male_score += wt * 0.08
            total_w += wt

        # ── Factor 3: Beard dark-pixel ratio (skin-tone adaptive) ────────────
        if chin_bgr.size > 30:
            wt        = 2.5
            chin_dark = self._dark_pixel_ratio(chin_bgr, face_v_mean)
            if chin_dark > 0.45:   male_score += wt
            elif chin_dark > 0.30: male_score += wt * 0.78
            elif chin_dark > 0.18: male_score += wt * 0.50
            elif chin_dark > 0.08: male_score += wt * 0.25
            else:                  male_score += wt * 0.05
            total_w += wt

        # ── Factor 4: Mustache dark-pixel ratio (weight 2.5) ─────────────────
        ulip_bgr = crop[int(h*0.50):int(h*0.64), int(w*0.28):int(w*0.72)]
        fore_bgr = crop[int(h*0.04):int(h*0.20), int(w*0.20):int(w*0.80)]
        if ulip_bgr.size > 20 and fore_bgr.size > 20:
            wt         = 2.5
            ulip_dark  = self._dark_pixel_ratio(ulip_bgr, face_v_mean)
            fore_dark  = self._dark_pixel_ratio(fore_bgr, face_v_mean)
            mst_signal = ulip_dark - fore_dark   # mustache makes ulip darker than forehead
            if mst_signal > 0.25:   male_score += wt
            elif mst_signal > 0.15: male_score += wt * 0.78
            elif mst_signal > 0.06: male_score += wt * 0.50
            elif mst_signal > 0.0:  male_score += wt * 0.28
            else:                   male_score += wt * 0.08
            total_w += wt

        # ── Factor 5: Mustache Laplacian texture (weight 1.5) ────────────────
        ulip_gray = gray[int(h*0.50):int(h*0.64), int(w*0.28):int(w*0.72)]
        fore_gray = gray[int(h*0.04):int(h*0.20), int(w*0.20):int(w*0.80)]
        if ulip_gray.size > 20 and fore_gray.size > 20:
            wt         = 1.5
            ulip_tex   = self._laplacian_variance(ulip_gray)
            fore_tex   = self._laplacian_variance(fore_gray)
            mst_tex    = ulip_tex / max(fore_tex, 1.0)
            if mst_tex > 2.0:   male_score += wt
            elif mst_tex > 1.5: male_score += wt * 0.75
            elif mst_tex > 1.1: male_score += wt * 0.45
            else:               male_score += wt * 0.15
            total_w += wt

        # ── Factor 6: Nose bridge width relative to eye span (weight 1.2) ────
        # Males have wider noses. Measure central band at nose-bridge height.
        nose_zone  = gray[int(h*0.38):int(h*0.56), int(w*0.30):int(w*0.70)]
        eye_zone   = gray[int(h*0.28):int(h*0.42), int(w*0.05):int(w*0.95)]
        if nose_zone.size > 20 and eye_zone.size > 20:
            wt = 1.2
            # Nose bridge is darker (shadow) relative to full-eye-span brightness
            nose_dark = self._dark_pixel_ratio(
                crop[int(h*0.38):int(h*0.56), int(w*0.30):int(w*0.70)], face_v_mean
            )
            if nose_dark > 0.35:   male_score += wt
            elif nose_dark > 0.22: male_score += wt * 0.70
            elif nose_dark > 0.12: male_score += wt * 0.40
            else:                  male_score += wt * 0.15
            total_w += wt

        # ── Factor 7: Skin overall texture variance (weight 0.8) ─────────────
        face_region = gray[int(h*0.20):int(h*0.75), int(w*0.18):int(w*0.82)]
        if face_region.size > 100:
            wt  = 0.8
            std = float(face_region.std())
            if std > 32:   male_score += wt
            elif std > 22: male_score += wt * 0.65
            else:          male_score += wt * 0.25
            total_w += wt

        # ── Factor 8: Face-shape prior (weight 0.7) ───────────────────────────
        wt   = 0.7
        bias = {"Square": 0.90, "Oblong": 0.75, "Oval": 0.52,
                "Round": 0.30, "Heart": 0.15}.get(face_shape, 0.50)
        male_score += wt * bias
        total_w    += wt

        raw        = male_score / max(total_w, 1.0)
        gender     = "Male" if raw >= 0.50 else "Female"
        confidence = raw if gender == "Male" else 1.0 - raw
        return {"gender": gender, "confidence": round(confidence, 3), "_raw": round(raw, 4)}

    # ── Ensemble ──────────────────────────────────────────────────────────────

    def _ensemble(self, dnn: "dict | None", h: dict) -> dict:
        """
        Combine DNN and heuristic predictions.

        Physical evidence (beard / mustache) is highly reliable and should
        override a mis-firing DNN.  The heuristic's raw male-probability score
        is used directly so we can apply graded thresholds.
        """
        h_raw   = h.get("_raw", 0.5)          # raw male-probability from heuristic
        h_clean = {"gender": h["gender"], "confidence": h["confidence"]}

        if dnn is None:
            return h_clean

        # Agreement → blend confidences slightly upward
        if dnn["gender"] == h["gender"]:
            blended = min(1.0, dnn["confidence"] * 0.65 + h["confidence"] * 0.35)
            return {"gender": dnn["gender"], "confidence": round(blended, 3)}

        # Disagreement — decide who to trust
        # If physical evidence is STRONGLY male (beard/mustache visible), override DNN
        if h_raw >= 0.58:
            logger.info(
                "Physical override: heuristic=%s(raw=%.2f) overrides DNN=%s(%.2f)",
                h["gender"], h_raw, dnn["gender"], dnn["confidence"],
            )
            return h_clean

        # If physical evidence is STRONGLY female, trust it too
        if h_raw <= 0.42:
            logger.info(
                "Physical override: heuristic=%s(raw=%.2f) overrides DNN=%s(%.2f)",
                h["gender"], h_raw, dnn["gender"], dnn["confidence"],
            )
            return h_clean

        # DNN is confident and heuristic is ambiguous → trust DNN
        if dnn["confidence"] >= 0.82:
            return dnn

        # Both uncertain — average their raw scores
        dnn_raw   = dnn["confidence"] if dnn["gender"] == "Male" else 1.0 - dnn["confidence"]
        avg_raw   = dnn_raw * 0.55 + h_raw * 0.45
        gender    = "Male" if avg_raw >= 0.50 else "Female"
        confidence = avg_raw if gender == "Male" else 1.0 - avg_raw
        return {"gender": gender, "confidence": round(confidence, 3)}

    # ── Public ────────────────────────────────────────────────────────────────

    def classify(
        self,
        face_result: "FaceResult",
        face_shape: str = "Oval",
    ) -> dict:
        """
        Priority chain:
          1. DeepFace (ArcFace/VGG-Face) — best accuracy, ~95%+
          2. If DeepFace unavailable → ensemble(Levi-Hassner DNN, heuristic)
          3. Heuristic physical evidence can still override both when very strong
        """
        if not face_result.detected or face_result.face_crop is None:
            return {"gender": "Unknown", "confidence": 0.0}

        heuristic = self._heuristic_predict(face_result, face_shape)
        h_raw     = heuristic.get("_raw", 0.5)

        # ── Try DeepFace first ────────────────────────────────────────────────
        if _DEEPFACE_AVAILABLE:
            df_result = self._deepface_predict(face_result.face_crop)
            if df_result is not None:
                # Strong physical evidence (beard/mustache) still overrides DeepFace
                # when DeepFace is very wrong (h_raw≥0.70 = very obvious male features)
                if df_result["gender"] != heuristic["gender"] and h_raw >= 0.70:
                    logger.info(
                        "Physical override DeepFace: heuristic=%s(%.2f) vs DeepFace=%s(%.2f)",
                        heuristic["gender"], h_raw, df_result["gender"], df_result["confidence"],
                    )
                    return {"gender": heuristic["gender"], "confidence": heuristic["confidence"]}
                logger.debug(
                    "DeepFace → %s(%.2f)  [heuristic=%s raw=%.2f]",
                    df_result["gender"], df_result["confidence"],
                    heuristic["gender"], h_raw,
                )
                return df_result

        # ── Fallback: Levi-Hassner DNN + heuristic ensemble ──────────────────
        dnn_result = self._dnn_predict(face_result.face_crop)
        result     = self._ensemble(dnn_result, heuristic)
        logger.debug(
            "Ensemble → %s(%.2f)  [dnn=%s heuristic=%s raw=%.2f]",
            result["gender"], result["confidence"],
            dnn_result["gender"] if dnn_result else "N/A",
            heuristic["gender"], h_raw,
        )
        return result
