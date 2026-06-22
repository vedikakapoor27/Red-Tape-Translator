from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    DATABASE_URL: str
    ANTHROPIC_API_KEY: str
    CLERK_SECRET_KEY: str
    CLERK_PUBLISHABLE_KEY: str
    CLERK_JWT_ISSUER: str
    ENVIRONMENT: str = "development"
    RATE_LIMIT_PER_MINUTE: int = 10

    class Config:
        env_file = ".env"

settings = Settings()