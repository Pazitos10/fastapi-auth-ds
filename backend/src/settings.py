import os
from dotenv import load_dotenv
from typing import Dict, Any

load_dotenv()

ENV = os.getenv("ENV")
ALGORITHM = os.getenv("ALGORITHM")
SECRET_KEY = os.getenv("SECRET_KEY")
REFRESH_SECRET_KEY = os.getenv("REFRESH_SECRET_KEY")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES"))
REFRESH_TOKEN_EXPIRE_DAYS = int(os.getenv("REFRESH_TOKEN_EXPIRE_DAYS"))
TOKEN_URL = os.getenv("TOKEN_URL")
DB_URL = os.getenv("DB_URL")
ROOT_PATH = os.getenv("ROOT_PATH")
MAIN_SITE_DOMAIN = os.getenv(f"MAIN_SITE_DOMAIN_{ENV}")
API_SITE_DOMAIN = os.getenv(f"API_SITE_DOMAIN_{ENV}")
SECURE_COOKIES = bool(os.getenv("SECURE_COOKIES"))
REFRESH_TOKEN_COOKIE_NAME = os.getenv("REFRESH_TOKEN_COOKIE_NAME")
ACCESS_TOKEN_COOKIE_NAME = os.getenv("ACCESS_TOKEN_COOKIE_NAME")

def get_base_cookie_config(key: str) -> Dict:
    return {
        "key": key,
        "httponly": True,
        "samesite": "lax",
        "secure": SECURE_COOKIES,
        "domain": API_SITE_DOMAIN,
        "path": "/"
    }

def get_token_settings(key: str, token: str, max_age: int) -> Dict[str, Any]:
    base_cookie = get_base_cookie_config(key)

    return {
        **base_cookie,
        "value": token,
        "max_age": max_age,
    }

def get_refresh_token_settings(refresh_token: str) -> Dict[str, Any]:
    refresh_token = get_token_settings(
        REFRESH_TOKEN_COOKIE_NAME, refresh_token, REFRESH_TOKEN_EXPIRE_DAYS * 24 * 60
    )
    return refresh_token 

def get_delete_token_settings() -> None: 
    token_settings = get_base_cookie_config("refresh_token")
    return token_settings
