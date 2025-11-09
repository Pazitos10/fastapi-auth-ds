from fastapi import Depends, APIRouter, HTTPException, Path
from sqlalchemy.orm import Session
from typing import List
from src.auth.dependencies import (
    get_current_user,
    has_admin_role,
    has_access_to_user
)
from src.database import get_db
from src.users import service, schemas, utils, exceptions

router = APIRouter(prefix="/users", tags=["users"])


@router.get("/", response_model=List[schemas.User])
def read_users(
    db: Session = Depends(get_db),
    user: schemas.User = Depends(has_admin_role),
):
    users = service.get_users(db, user)
    return users


@router.get("/{user_id}", response_model=schemas.User)
def read_user(
    user_id: int = Depends(has_access_to_user),
    db: Session = Depends(get_db),
    user: schemas.User = Depends(get_current_user),
):
    db_user = service.get_user(db, user_id=user_id)
    return db_user


@router.post("/", response_model=schemas.User)
async def create_user(
    user: schemas.UserCreate,
    db: Session = Depends(get_db),
    auth_user = Depends(has_admin_role)
):
    return service.create_user(db, user)


@router.patch("/{user_id}", response_model=schemas.User)
def update_user(
    user: schemas.UserUpdate,
    user_id: int = Depends(has_access_to_user),
    db: Session = Depends(get_db),
):
    db_user = read_user(user_id, db)
    updated_user = service.update_user(db, db_user, updated_user=user)
    return updated_user


@router.delete("/{user_id}", response_model=schemas.UserDelete)
def delete_user(
    user_id: int,
    db: Session = Depends(get_db),
    user: schemas.User = Depends(has_admin_role),
):
    if user_id == user.id:
        raise exceptions.UserCannotDeleteItself()
    db_user = read_user(user_id, db)
    deleted_user_user_id = service.delete_user(db, db_user)
    if not deleted_user_user_id:
        raise HTTPException(status_code=400, detail="El usuario no pudo ser eliminado")
    return {
        "id": deleted_user_user_id,
        "msg": f"Usuario {deleted_user_user_id} eliminado exitosamente!",
    }


@router.patch("/{user_id}/role", response_model=schemas.User)
def assign_role(
    user_id: int,
    role_id: int,
    db: Session = Depends(get_db),
    user: schemas.User = Depends(has_admin_role),
):
    return service.assign_role(db=db, user_id=user_id, role_id=role_id)
