from sqlalchemy import String
from sqlalchemy.orm import DeclarativeBase, declared_attr, Mapped, mapped_column


class EntityBase(DeclarativeBase):

    @declared_attr
    def __tablename__(self):
        return self.__name__


class User(EntityBase):

    spotify_id: Mapped[str] = mapped_column(String(64), primary_key=True)
