from src.database import engine, Base, SessionLocal
from src.users.models import Role, User
from src.users.schemas import UserCreate
from src.users.service import create_user, assign_role


def main():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    roles = [
        "user",
        "admin",
        "alumno",
        "docente",
        "secretaria_academica",
    ]
    for rol in roles:
        rol_usuario = Role(name=rol)
        db.add(rol_usuario)
        db.commit()
        db.refresh(rol_usuario)

        usuario = create_user(
            db,
            UserCreate(
                username=rol, email=f"{rol}@gmail.com", password="123456789"
            ),
        )

        db.add(usuario)
        db.commit()

        assign_role(db=db, user_id=usuario.id, role_id=rol_usuario.id)

    db.close()


if __name__ == "__main__":
    main()
