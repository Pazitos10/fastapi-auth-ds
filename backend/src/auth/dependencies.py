import jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from typing import Annotated, Dict, Any
from jwt.exceptions import InvalidTokenError
from src.exceptions import PermissionDenied
from src.database import get_db
from src.settings import TOKEN_URL, SECRET_KEY, ALGORITHM
from src.auth.schemas import TokenData
from src.auth.utils import _is_valid_refresh_token, parse_refresh_token
from src.auth import exceptions
from src.users import service as users_service
from src.users import models as users_models
from src.users import schemas as users_schemas

oauth2_scheme = OAuth2PasswordBearer(tokenUrl=TOKEN_URL)


async def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db),
):
    try:
        payload = jwt.decode(
            token, SECRET_KEY, algorithms=[ALGORITHM]
        )
        user_str = payload.get("sub")
        if user_str is None:
            raise exceptions.InvalidCredentials()
        user = users_schemas.User.model_validate_json(
            user_str
        )  # creating User schema with the data from the token.
        token_data = TokenData(username=user.username)
    except InvalidTokenError:
        raise exceptions.InvalidCredentials()
    user = users_service.get_user_by_username(db, username=token_data.username)
    if user is None:
        raise exceptions.InvalidCredentials()
    return user

async def has_role(
    role_name: str,
    db: Session = Depends(get_db),
    user: users_schemas.User = Depends(get_current_user),
) -> users_schemas.User:
    role = db.query(users_models.Role).filter(users_models.Role.name == role_name).first()
    if role and user.role_id == role.id:
        return user
    return None


async def has_admin_role(
    db: Session = Depends(get_db),
    user: users_schemas.User = Depends(get_current_user),
) -> users_schemas.User:
    user = await has_role("admin", db, user)
    if user:
        return user
    raise PermissionDenied()


async def has_access_to_user(
    user_id: int,
    auth_user: users_schemas.User = Depends(get_current_user),
) -> users_schemas.User:
    if auth_user.is_admin or int(user_id) == auth_user.id:
        return user_id
    raise PermissionDenied()


async def valid_refresh_token(
    refresh_token: str,
) -> Dict[str, Any]:
    parsed_token = parse_refresh_token(refresh_token)

    if not _is_valid_refresh_token(parsed_token.expires_at):
        raise exceptions.RefreshTokenNotValid()

    return parsed_token


async def valid_refresh_token_user(
    refresh_token: Dict[str, Any] = Depends(valid_refresh_token),
    db: Session = Depends(get_db),
) -> Dict[str, Any]:
    user = users_service.get_user(db, refresh_token.user_id)
    if not user:
        raise exceptions.RefreshTokenNotValid()

    return user
