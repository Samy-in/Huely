"""Pydantic request / response schemas."""
from __future__ import annotations

from typing import Any, Literal, Optional
from pydantic import BaseModel, Field, field_validator


class AnalyzeRequest(BaseModel):
    image: str = Field(
        ...,
        description="Base64-encoded image string (with or without data URI prefix).",
    )
    occasion: str = Field(
        default="Casual",
        description="Target occasion: Casual | Formal | Party",
    )

    @field_validator("occasion")
    @classmethod
    def validate_occasion(cls, v: str) -> str:
        allowed = {"Casual", "Formal", "Party"}
        if v not in allowed:
            raise ValueError(f"occasion must be one of {allowed}")
        return v

    gender_override: Optional[Literal["Male", "Female"]] = Field(
        default=None,
        description="Optional: force gender to Male or Female.",
    )

    @field_validator("image")
    @classmethod
    def validate_image_not_empty(cls, v: str) -> str:
        if not v or len(v.strip()) < 10:
            raise ValueError("image field must not be empty.")
        return v.strip()


class ColorSwatch(BaseModel):
    hex: str
    rgb: list[int]
    percent: float


class AnalyzeResponse(BaseModel):
    face_detected: bool
    face_shape: Optional[str] = None
    skin_tone: Optional[str] = None
    undertone: Optional[str] = None
    gender: Optional[str] = None
    gender_confidence: Optional[float] = None
    ita: Optional[float] = None
    palette: list[ColorSwatch] = []
    recommended_colors: list[str] = []
    outfit_suggestions: list[str] = []
    style_tips: list[str] = []
    color_scores: dict[str, float] = {}
    occasion: str = "Casual"


class HealthResponse(BaseModel):
    status: str
    version: str


class OutfitsRequest(BaseModel):
    gender: Literal["Male", "Female"]
    face_shape: str = "Oval"
    occasion: str = "Casual"

    @field_validator("occasion")
    @classmethod
    def validate_occasion(cls, v: str) -> str:
        allowed = {"Casual", "Formal", "Party"}
        if v not in allowed:
            raise ValueError(f"occasion must be one of {allowed}")
        return v


class OutfitsResponse(BaseModel):
    outfit_suggestions: list[str]
    occasion: str
