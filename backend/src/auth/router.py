from fastapi import Depends, APIRouter, Response
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from typing import Dict, Any
from src.database import get_db
from src.settings import get_refresh_token_settings
from src.auth import service
from src.auth import schemas
from src.auth.utils import create_access_token, create_refresh_token
from src.auth.dependencies import (
    valid_refresh_token, 
    valid_refresh_token_user, 
    get_current_user
)
from src.users import schemas as users_schemas
from src.users import service as users_service

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/token")
async def login(
    response: Response,
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db),
) -> schemas.Token:
    user = service.authenticate_user(form_data.username, form_data.password, db)
    refresh_token_value = await create_refresh_token(db, user.id)
    response.set_cookie(**get_refresh_token_settings(refresh_token_value))

    return schemas.Token(
        access_token=create_access_token(user),
        refresh_token=refresh_token_value
    )


@router.put("/token", response_model=schemas.Token)
async def refresh_tokens(
    response: Response,
    db: Session = Depends(get_db),
    user=Depends(valid_refresh_token_user),
    refresh_token=Depends(valid_refresh_token),
):
    new_access_token = create_access_token(user)
    new_refresh_token = await create_refresh_token(
        db, refresh_token.user_id
    )
    response.set_cookie(**get_refresh_token_settings(new_refresh_token))

    return schemas.Token(access_token=new_access_token, refresh_token=new_refresh_token)


@router.post("/register", response_model=users_schemas.User)
def register_user(user: users_schemas.UserCreate, db: Session = Depends(get_db)):
    db_user = users_service.create_user(db=db, user=user)
    return db_user


@router.delete("/token")
async def logout_user(
    response: Response,
    refresh_token: Dict[str, Any] = Depends(valid_refresh_token),
) -> dict:
    response.delete_cookie(
        **get_refresh_token_settings(refresh_token.refresh_token, expired=True)
    )

    return {
        "msg": "La sesión se ha cerrado exitosamente!",
    }


@router.post("/forgot-password")
async def forgot_password(
    forgot_password_data: schemas.ForgotPasswordData,
    db: Session = Depends(get_db),
) -> schemas.ForgotPasswordEmailSent:
    return service.send_password_recovery_email(db, forgot_password_data)


@router.post("/password-recovery")
async def password_recovery(
    token: str,
    password_update_data: schemas.PasswordUpdateData,
    db: Session = Depends(get_db),
) -> schemas.PasswordUpdated:
    return service.update_user_password(db, token, password_update_data)


@router.post("/password-reset")
async def password_reset(
    password_reset_data: schemas.PasswordResetData,
    user=Depends(get_current_user),
    db: Session = Depends(get_db),
) -> schemas.PasswordUpdated:
    return service.reset_user_password(db, user, password_reset_data)
