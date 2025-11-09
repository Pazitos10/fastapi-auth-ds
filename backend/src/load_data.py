from src.database import engine, Base, SessionLocal
from src.users.models import Role, User
from src.users.schemas import UserCreate
from src.users.service import create_user, assign_role


def main():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    rol_admin = Role(name="admin")
    rol_user = Role(name="user")

    db.add_all([rol_admin, rol_user])
    db.commit()

    usuario_admin = create_user(
        db,
        UserCreate(
            username="admin", email="admin@gmail.com", password="mipasswordsuperseguro"
        ),
    )

    usuario_normal = create_user(
        db,
        UserCreate(
            username="normal",
            email="usuario1@gmail.com",
            password="mipasswordsuperseguro",
        ),
    )

    db.add_all([usuario_admin, usuario_normal])
    db.commit()

    assign_role(db=db, user_id=usuario_admin.id, role_id=rol_admin.id)
    assign_role(db=db, user_id=usuario_normal.id, role_id=rol_user.id)
    
    db.close()


if __name__ == "__main__":
    main()
