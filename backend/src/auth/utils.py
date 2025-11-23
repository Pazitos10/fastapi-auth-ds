import jwt
import datetime
from jwt.exceptions import InvalidTokenError
from fastapi import Depends
from pwdlib import PasswordHash
from sqlalchemy import select
from sqlalchemy.orm import Session
from typing import Optional
from src.settings import (
    REFRESH_SECRET_KEY,
    SECRET_KEY,
    ALGORITHM,
    ACCESS_TOKEN_EXPIRE_MINUTES,
    REFRESH_TOKEN_EXPIRE_DAYS,
)
from src.database import get_db
from src.auth import schemas, exceptions
from src.auth.models import AuthPasswordRecoveryToken as RecoveryToken
from src.users import models as users_models
from src.users import schemas as users_schemas
from src.users import utils as users_utils

password_hash = PasswordHash.recommended()


def check_passwords_match(password: str, hashed_password: str) -> None:
    if not verify_password(password, hashed_password):
        raise exceptions.IncorrectUserOrPassword()


def verify_password(plain_password, hashed_password):
    return password_hash.verify(plain_password, hashed_password)


def get_password_hash(password):
    return password_hash.hash(password)


def encode_token(
    data: dict, expires_delta_minutes: Optional[int] = 15, key: str = SECRET_KEY
):
    to_encode = data.copy()
    expire = datetime.datetime.now(datetime.UTC) + datetime.timedelta(
        minutes=expires_delta_minutes
    )
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, key, algorithm=ALGORITHM)
    return encoded_jwt


def create_access_token(
    user: users_models.User, expiration_minutes: int = ACCESS_TOKEN_EXPIRE_MINUTES
):
    serialized_user = users_schemas.User.model_validate(user).model_dump_json()
    access_token = encode_token(
        data={"sub": serialized_user},
        expires_delta_minutes=expiration_minutes,
    )
    return access_token


async def create_refresh_token(db: Session, user_id: int) -> str:
    user = db.scalar(select(users_models.User).where(users_models.User.id == user_id))
    expiration_minutes = REFRESH_TOKEN_EXPIRE_DAYS * 24 * 60
    serialized_user = users_schemas.User.model_validate(user).model_dump_json()
    refresh_token = encode_token(
        data={"sub": serialized_user},
        expires_delta_minutes=expiration_minutes,
        key=REFRESH_SECRET_KEY,
    )
    return refresh_token


def _is_valid_refresh_token(expires_at: datetime) -> bool:
    return datetime.datetime.now(datetime.UTC) <= expires_at.astimezone(datetime.UTC)


def get_user_password_update_token(
    token: str,
    db: Session = Depends(get_db),
) -> None:
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        import pdb

        pdb.set_trace()
        recovery_token_obj = db.scalar(
            select(RecoveryToken).where(RecoveryToken.recovery_token == token)
        )
        if not recovery_token_obj:
            raise exceptions.InvalidPasswordUpdateToken()

        user = users_utils.get_user_by_email(db, email=payload.get("email"))
        if (
            payload.get("email") != recovery_token_obj.email
            or payload.get("user_id") != user.id
        ):
            raise exceptions.InvalidPasswordUpdateToken()
        return user
    except InvalidTokenError:
        raise exceptions.InvalidPasswordUpdateToken()
