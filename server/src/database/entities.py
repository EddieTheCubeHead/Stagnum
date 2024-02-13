from __future__ import annotations

from datetime import datetime, timezone

from sqlalchemy import String, DateTime, Integer, ForeignKey
from sqlalchemy.orm import DeclarativeBase, declared_attr, Mapped, mapped_column, relationship


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


class PoolMember(EntityBase):

    id: Mapped[int] = mapped_column(Integer(), primary_key=True, autoincrement=True)
    name: Mapped[str] = mapped_column(String(64), nullable=False)
    user_id: Mapped[str] = mapped_column(String(64), nullable=False)
    image_url: Mapped[str] = mapped_column(String(64), nullable=False)
    content_uri: Mapped[str] = mapped_column(String(64), default=None, nullable=True)
    sort_order: Mapped[int] = mapped_column(Integer(), nullable=True)
    parent_id: Mapped[int] = mapped_column(ForeignKey("PoolMember.id"), default=None, nullable=True)
    weight: Mapped[float] = mapped_column(Integer(), default=1, nullable=False)

    parent: Mapped["PoolMember"] = relationship(lazy="joined")
    children: Mapped[list["PoolMember"]] = relationship(lazy="joined")
