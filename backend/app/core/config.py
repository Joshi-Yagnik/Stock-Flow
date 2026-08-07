"""
Application configuration settings using Pydantic BaseSettings.
Load environment variables from .env file.
"""
from typing import List
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
    )

    # App
    APP_NAME: str = "StockFlow"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = False

    # Database
    DATABASE_URL: str = "postgresql+asyncpg://stockflow_user:stockflow_pass@localhost:5432/stockflow_db"

    # JWT
    SECRET_KEY: str = "change-this-secret-key-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 24 hours
    REFRESH_TOKEN_EXPIRE_DAYS: int = 30

    # CORS
    ALLOWED_ORIGINS: List[str] = [
        "http://localhost:5173",
        "http://localhost:3000",
        "https://stockflow.app",
    ]

    # Pagination
    DEFAULT_PAGE_SIZE: int = 20
    MAX_PAGE_SIZE: int = 100

    # Business Logic
    DEFAULT_TAX_RATE: float = 18.0
    DEFAULT_CURRENCY: str = "INR"
    DEFAULT_LOW_STOCK_THRESHOLD: int = 10


settings = Settings()
