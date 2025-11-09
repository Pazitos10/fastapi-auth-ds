from sqlalchemy import ForeignKey, String
from sqlalchemy.orm import relationship, mapped_column, Mapped
from pydantic import EmailStr
from typing import Optional
from src.database import Base

class User(Base):
    __tablename__ = "user"

    id: Mapped[int] = mapped_column(primary_key=True, index=True, autoincrement=True)
    username: Mapped[str] = mapped_column(String(255), unique=True, index=True)
    email: Mapped[EmailStr] = mapped_column(String(255))
    hashed_password: Mapped[str] = mapped_column(String(255))

    role_id: Mapped[Optional[int]] = mapped_column(ForeignKey("role.id"))
    role: Mapped[Optional["Role"]] = relationship("Role")

    @property
    def is_admin(self):
        return self.role_id == 1

    @property
    def role_name(self):
        return self.role.name


class Role(Base):
    __tablename__ = "role"

    id: Mapped[int] = mapped_column(primary_key=True, index=True, autoincrement=True)
    name: Mapped[str] = mapped_column(String(255), unique=True, index=True)
