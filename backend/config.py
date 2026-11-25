"""
Ad Waste Finder – application configuration.
"""

from pydantic_settings import BaseSettings
from typing import Optional


class Settings(BaseSettings):
    """Application-level settings loaded from env / .env."""

    APP_NAME: str = "Ad Waste Finder"
    DEBUG: bool = True

    # Database
    DATABASE_URL: str = "sqlite+aiosqlite:///backend/ad_waste_finder.db"

    # CORS
    CORS_ORIGINS: list[str] = ["http://localhost:3000"]

    # Default analysis settings (written into `settings` table on first boot)
    DEFAULT_MIN_DAYS: int = 14
    DEFAULT_MIN_SPEND: float = 10_000.0
    DEFAULT_SPEND_MULTIPLE_OF_TARGET_CPA: float = 10.0
    DEFAULT_MIN_CLICKS: int = 100
    DEFAULT_MATURITY_DAYS: int = 3
    DEFAULT_FLAG_CPA_RATIO: float = 1.5
    DEFAULT_CONFIDENCE_THRESHOLD: float = 0.80
    DEFAULT_SHIFT_PERCENT: float = 25.0
    DEFAULT_RECHECK_DAYS: int = 7
    DEFAULT_SATURATION_TOLERANCE: float = 0.20

    # Simulator
    SIMULATOR_SEED: int = 42
    SIMULATOR_DEFAULT_SPEED: float = 1.0  # 1 second = 1 virtual day

    # CSV
    CSV_MAX_SIZE_BYTES: int = 10 * 1024 * 1024  # 10 MB

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"


settings = Settings()
