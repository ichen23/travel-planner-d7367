from pydantic_settings import BaseSettings, SettingsConfigDict
from functools import lru_cache
import os

ENV_FILE = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), ".env")

class Settings(BaseSettings):
    JUHE_API_KEY: str = ""
    AMAP_KEY: str = ""
    AMAP_SECRET: str = ""
    HOST: str = "0.0.0.0"
    PORT: int = 8000
    
    model_config = SettingsConfigDict(
        env_file=ENV_FILE,
        env_file_encoding="utf-8",
        extra="ignore"
    )

@lru_cache()
def get_settings():
    return Settings()
