import os
from dotenv import load_dotenv

load_dotenv()


class Settings:
    ADMIN_USERNAME: str = os.getenv("ADMIN_USERNAME", "admin")
    ADMIN_PASSWORD: str = os.getenv("ADMIN_PASSWORD", "admin")

    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./sql_app.db")

    APP_NAME: str = os.getenv("APP_NAME", "Request Tracker API")
    DEBUG: bool = os.getenv("DEBUG", "True").lower() == "true"

    CORS_ORIGINS: list = [
        "http://localhost:5173",
        "http://localhost:3000",
        "http://127.0.0.1:5173",
    ]


settings = Settings()
