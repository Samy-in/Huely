"""Color suitability scoring using Euclidean distance in RGB space."""
from __future__ import annotations

import numpy as np

# Named color reference table (name → RGB)
_COLOR_RGB: dict[str, list[int]] = {
    "Terracotta":      [204, 105,  74],
    "Warm Beige":      [225, 198, 153],
    "Olive Green":     [107, 142,  35],
    "Mustard":         [219, 161,  11],
    "Rust":            [183,  65,  14],
    "Peach":           [255, 218, 185],
    "Camel":           [193, 154, 107],
    "Warm Brown":      [139,  90,  43],
    "Ivory":           [255, 255, 240],
    "Burgundy":        [128,   0,  32],
    "Forest Green":    [ 34, 139,  34],
    "Gold":            [255, 215,   0],
    "Coral":           [255, 127,  80],
    "Burnt Orange":    [204,  85,   0],
    "Champagne Gold":  [250, 214, 165],
    "Warm Red":        [199,  44,  72],
    "Bronze":          [205, 127,  50],
    "Lavender":        [230, 230, 250],
    "Sky Blue":        [135, 206, 235],
    "Cool Gray":       [163, 163, 163],
    "Soft Pink":       [255, 182, 193],
    "Mint":            [152, 251, 152],
    "Powder Blue":     [176, 224, 230],
    "Navy":            [ 31,  31, 108],
    "Charcoal":        [ 54,  69,  79],
    "Plum":            [142,  69, 133],
    "Ice Blue":        [153, 203, 225],
    "Silver Gray":     [192, 192, 192],
    "Blush":           [255, 111, 144],
    "Electric Blue":   [125, 249, 255],
    "Fuchsia":         [255,   0, 255],
    "Silver":          [192, 192, 192],
    "Deep Purple":     [ 72,  52, 212],
    "Emerald":         [  0, 201,  87],
    "Cobalt":          [ 61,  89, 171],
    "White":           [255, 255, 255],
    "Beige":           [245, 245, 220],
    "Sage Green":      [188, 205, 154],
    "Denim Blue":      [ 72, 106, 161],
    "Soft Gray":       [211, 211, 211],
    "Taupe":           [ 72,  60,  50],
    "Classic Black":   [  0,   0,   0],
    "Crisp White":     [255, 255, 255],
    "Slate Blue":      [106,  90, 205],
    "Warm Gray":       [128, 128, 118],
    "Nude":            [225, 190, 152],
    "Deep Teal":       [  0, 128, 128],
    "Jewel Tones":     [ 68,  85, 131],
    "Wine":            [114,  47,  55],
    "Rose Gold":       [183, 110, 121],
    "Midnight Blue":   [ 25,  25, 112],
    "Champagne":       [247, 231, 206],
    "Pinstripe":       [ 80,  80,  80],
}

# Maximum possible RGB distance (diagonal of cube)
_MAX_DIST = np.sqrt(3 * 255**2)


def score_color(skin_rgb: list[int], color_name: str) -> float:
    """
    Returns a suitability score 0–100 for `color_name` given the skin RGB.

    Higher score = more complementary (more contrast / harmony).
    Strategy: moderate Euclidean distance from skin tone → high score.
    Very close (blends in) or extremely far (clashes) both score lower.

    Bell-curve centred around 35 % of the colour space distance.
    """
    ref = _COLOR_RGB.get(color_name)
    if ref is None:
        return 50.0  # Unknown color → neutral score

    skin = np.array(skin_rgb, dtype=float)
    col = np.array(ref, dtype=float)
    dist = float(np.linalg.norm(skin - col))
    norm_dist = dist / _MAX_DIST  # 0 → 1

    # Bell curve: peak at norm_dist ≈ 0.35
    score = 100.0 * np.exp(-((norm_dist - 0.35) ** 2) / (2 * 0.15**2))
    return round(float(score), 1)


def score_colors(skin_rgb: list[int], color_names: list[str]) -> dict[str, float]:
    """Return a dict mapping each color name to its suitability score."""
    return {name: score_color(skin_rgb, name) for name in color_names}
