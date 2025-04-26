import os
from pydantic import BaseSettings


class Settings(BaseSettings):
    """Application settings."""
    # API settings
    API_V1_STR: str = "/api"
    PROJECT_NAME: str = "KaigiNote"

    # Security settings
    SECRET_KEY: str = os.getenv(
        "SECRET_KEY", "your-secret-key-for-development")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30

    # Database settings
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./kaigi_note.db")

    # Discord webhook URL
    DISCORD_WEBHOOK_URL: str = os.getenv("DISCORD_WEBHOOK_URL", "")

    class Config:
        case_sensitive = True


settings = Settings()
