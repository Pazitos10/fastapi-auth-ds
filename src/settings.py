import os
from dotenv import load_dotenv
from typing import Dict, Any

load_dotenv()

ENV = os.getenv("ENV")
ALGORITHM = os.getenv("ALGORITHM")
SECRET_KEY = os.getenv("SECRET_KEY")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES"))
REFRESH_TOKEN_EXPIRE_DAYS = int(os.getenv("REFRESH_TOKEN_EXPIRE_DAYS"))
TOKEN_URL = os.getenv("TOKEN_URL")
DB_URL = os.getenv("DB_URL")
ROOT_PATH = os.getenv("ROOT_PATH")
MAIN_SITE_DOMAIN = os.getenv(f"MAIN_SITE_DOMAIN_{ENV}")
API_SITE_DOMAIN = os.getenv(f"API_SITE_DOMAIN_{ENV}")
SECURE_COOKIES = os.getenv("SECURE_COOKIES")
REFRESH_TOKEN_SECRET_KEY = os.getenv("REFRESH_TOKEN_SECRET_KEY")

def get_refresh_token_settings(
    refresh_token: str,
    expired: bool = False,
) -> Dict[str, Any]:
    base_cookie = {
        "key": REFRESH_TOKEN_SECRET_KEY,
        "httponly": True,
        "samesite": "none",
        "secure": SECURE_COOKIES,
        "domain": API_SITE_DOMAIN,
    }
    if expired:
        return base_cookie

    return {
        **base_cookie,
        "value": refresh_token,
        "max_age": REFRESH_TOKEN_EXPIRE_DAYS,
    }
