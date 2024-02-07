from datetime import datetime, timezone

from sqlalchemy import String, DateTime
from sqlalchemy.orm import DeclarativeBase, declared_attr, Mapped, mapped_column


class EntityBase(DeclarativeBase):

    @declared_attr
    def __tablename__(self):
        return self.__name__

    insert_time_stamp: Mapped[datetime] = mapped_column(DateTime, insert_default=datetime.now(timezone.utc))


class User(EntityBase):

    spotify_id: Mapped[str] = mapped_column(String(64), primary_key=True)
    spotify_username: Mapped[str] = mapped_column(String(64))
    spotify_avatar_url: Mapped[str] = mapped_column(String(256))


class LoginState(EntityBase):

    state_string: Mapped[str] = mapped_column(String(16), primary_key=True)
