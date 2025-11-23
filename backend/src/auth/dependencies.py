import jwt
from datetime import datetime
from fastapi import Depends, Request
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy import select
from sqlalchemy.orm import Session
from jwt.exceptions import (
    InvalidTokenError,
    ExpiredSignatureError,
)
from src.database import get_db
from src.settings import (
    REFRESH_SECRET_KEY,
    REFRESH_TOKEN_COOKIE_NAME,
    TOKEN_URL,
    SECRET_KEY,
    ALGORITHM)
from src.auth.schemas import TokenData
from src.auth.utils import _is_valid_refresh_token
from src.auth import exceptions, constants
from src.users import service as users_service
from src.users import models as users_models
from src.users import schemas as users_schemas

oauth2_scheme = OAuth2PasswordBearer(tokenUrl=TOKEN_URL)


def get_token_from_cookie(request: Request) -> str:
    """
    Obtiene el JWT desde la cookie.
    Si el token no existe, lanza la excepción NotAuthenticated()
    """
    token = request.cookies.get(REFRESH_TOKEN_COOKIE_NAME)
    if not token:
        raise exceptions.RefreshTokenNotValid()
    return token

async def get_refresh_user(
    db: Session = Depends(get_db),
    token: str = Depends(get_token_from_cookie),    
):
    """Obtiene el objeto User (DB) que está asociado al refresh token."""
    try:
        payload = jwt.decode(token, REFRESH_SECRET_KEY, algorithms=[ALGORITHM])
        expires_at = datetime.fromtimestamp(payload.get("exp"))
        if not _is_valid_refresh_token(expires_at):
            raise exceptions.RefreshTokenNotValid()
        else:
            user_str = payload.get("sub")
            if user_str is None:
                raise exceptions.InvalidCredentials()
            user = users_schemas.User.model_validate_json(user_str)
            token_data = TokenData(username=user.username)
    except InvalidTokenError as e:
        raise exceptions.RefreshTokenNotValid()
    user = users_service.get_user_by_username(db, username=token_data.username)
    if user is None:
        raise exceptions.InvalidCredentials()
    return user

async def get_current_user(
    db: Session = Depends(get_db),
    token: str = Depends(oauth2_scheme),
):
    """Obtiene el objeto User (DB) que está asociado al access token."""
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_str = payload.get("sub")
        if user_str is None:
            raise exceptions.InvalidCredentials()
        user = users_schemas.User.model_validate_json(user_str)
        token_data = TokenData(username=user.username)
    except ExpiredSignatureError:
        raise exceptions.NotAuthenticated()
    user = users_service.get_user_by_username(db, username=token_data.username)
    if user is None:
        raise exceptions.InvalidCredentials()
    return user

async def has_role(
    role_name: str,
    db: Session = Depends(get_db),
    user: users_schemas.User = Depends(get_current_user),
) -> users_schemas.User:
    """Verifica que un usuario tenga un rol con el nombre indicado por `role_name`.
    Si es así, devuelve el objeto User.
    Caso contrario, lanza una excepción PermissionDenied().
    """
    role = db.scalar(
        select(users_models.Role).where(users_models.Role.name == role_name)
    )
    if role and user.role_id == role.id:
        return user
    raise exceptions.PermissionDenied()


async def has_admin_role(
    db: Session = Depends(get_db),
    user: users_schemas.User = Depends(get_current_user),
) -> users_schemas.User:
    """Verifica que un usuario tenga rol "admin"."""
    return await has_role("admin", db, user)


async def has_access_to_user(
    user_id: int,
    auth_user: users_schemas.User = Depends(get_current_user),
) -> users_schemas.User:
    """Verifica que un usuario tenga acceso a los datos del usuario con id = user_id.
    Esto ocurre si el usuario autenticado (auth_user) tiene el mismo id que user_id o si auth_user es admin.
    """

    if auth_user.is_admin or int(user_id) == auth_user.id:
        return user_id
    raise exceptions.PermissionDenied()
