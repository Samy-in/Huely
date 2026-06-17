"""
Rule tables — gender-aware outfit suggestions + colour/tip tables.
Loads recommendations dynamically from rules.json on modification.
"""
from __future__ import annotations

import json
import logging
import os
from pathlib import Path
from typing import Any

logger = logging.getLogger(__name__)

RULES_JSON_PATH = Path(__file__).parent / "rules.json"

_cached_rules: dict[str, Any] | None = None
_cached_mtime: float = 0.0


def _load_rules() -> dict[str, Any]:
    global _cached_rules, _cached_mtime
    try:
        if RULES_JSON_PATH.exists():
            mtime = os.path.getmtime(RULES_JSON_PATH)
            if _cached_rules is None or mtime > _cached_mtime:
                with open(RULES_JSON_PATH, "r", encoding="utf-8") as f:
                    _cached_rules = json.load(f)
                _cached_mtime = mtime
                logger.info("Loaded recommendation rules from rules.json (mtime: %s)", mtime)
        else:
            logger.error("rules.json not found at %s. Using empty recommendations.", RULES_JSON_PATH)
            _cached_rules = {}
    except Exception as exc:
        logger.exception("Error loading rules.json: %s", exc)
        if _cached_rules is None:
            _cached_rules = {}
    return _cached_rules


def get_color_recommendations(undertone: str, occasion: str) -> list[str]:
    rules = _load_rules()
    color_map = rules.get("UNDERTONE_COLOR_MAP", {})
    tone_map = color_map.get(undertone, color_map.get("Neutral", {}))
    return tone_map.get(occasion, tone_map.get("Casual", []))


def get_gender_outfit_recommendations(gender: str, face_shape: str, occasion: str) -> list[str]:
    rules = _load_rules()
    outfit_map = rules.get("GENDER_OUTFIT_MAP", {})
    if gender in outfit_map:
        g = outfit_map[gender]
        s = g.get(face_shape, g.get("Oval", {}))
        return s.get(occasion, s.get("Casual", []))
    
    neutral_map = rules.get("_NEUTRAL_MAP", {})
    s = neutral_map.get(face_shape, neutral_map.get("Oval", {}))
    return s.get(occasion, s.get("Casual", []))


def get_outfit_recommendations(face_shape: str, occasion: str) -> list[str]:
    return get_gender_outfit_recommendations("Unknown", face_shape, occasion)


def get_style_tips(skin_tone: str) -> list[str]:
    rules = _load_rules()
    tips_map = rules.get("SKIN_TONE_TIPS", {})
    return tips_map.get(skin_tone, [])
