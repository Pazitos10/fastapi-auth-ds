from pydantic import BaseModel, EmailStr
from datetime import datetime
from typing import Optional

class Token(BaseModel):
    access_token: str
    refresh_token: str


class TokenData(BaseModel):
    username: Optional[str] = None


class RefreshToken(BaseModel):
    user_id: int
    refresh_token: str
    expires_at: datetime
    valid: bool


class ForgotPasswordData(BaseModel):
    email: EmailStr


class ForgotPasswordEmailSent(BaseModel):
    msg: str
    url: Optional[str]


class PasswordUpdateData(BaseModel):
    new_password: str


class PasswordUpdated(BaseModel):
    msg: str


class PasswordResetData(BaseModel):
    new_password: str
    password: Optional[str] = None
    user_id: Optional[int] = None
