from __future__ import annotations

import datetime

from sqlalchemy import Boolean, DateTime, Float, ForeignKey, Integer, String
from sqlalchemy.orm import DeclarativeBase, Mapped, declared_attr, mapped_column, relationship


class EntityBase(DeclarativeBase):
    @declared_attr
    def __tablename__(self) -> str:
        return self.__name__

    insert_time_stamp: Mapped[datetime.datetime] = mapped_column(
        DateTime, insert_default=datetime.datetime.now(datetime.timezone.utc)
    )


class User(EntityBase):
    spotify_id: Mapped[str] = mapped_column(String(64), primary_key=True)
    spotify_username: Mapped[str] = mapped_column(String(64))
    spotify_avatar_url: Mapped[str] = mapped_column(String(512), nullable=True)

    session: Mapped[UserSession] = relationship(lazy="joined", back_populates="user", cascade="all, delete-orphan")
    joined_pool: Mapped[PoolJoinedUser] = relationship(lazy="joined", back_populates="user")

    own_transient_pool: Mapped[Pool] = relationship(back_populates="owner_user")


class UserSession(EntityBase):
    user_id: Mapped[str] = mapped_column(ForeignKey("User.spotify_id"), primary_key=True)
    user_token: Mapped[str] = mapped_column(String(512), nullable=False)
    refresh_token: Mapped[str] = mapped_column(String(512), nullable=False)
    last_login_token: Mapped[str | None] = mapped_column(String(512), nullable=True)
    expires_at: Mapped[datetime.datetime] = mapped_column(DateTime)

    user: Mapped[User] = relationship(lazy="joined", back_populates="session")


class LoginState(EntityBase):
    state_string: Mapped[str] = mapped_column(String(16), primary_key=True)


class PoolMember(EntityBase):
    id: Mapped[int] = mapped_column(Integer(), primary_key=True, autoincrement=True)
    name: Mapped[str] = mapped_column(String(128), nullable=False)
    user_id: Mapped[str] = mapped_column(ForeignKey("User.spotify_id"), nullable=False)
    pool_id: Mapped[int] = mapped_column(ForeignKey("Pool.id", ondelete="CASCADE", onupdate="CASCADE"), nullable=False)
    image_url: Mapped[str] = mapped_column(String(256), nullable=False)
    content_uri: Mapped[str] = mapped_column(String(128), nullable=False)
    duration_ms: Mapped[int] = mapped_column(Integer(), nullable=True)

    # Note: sort_order at the moment just ensures collections are internally sound. Once we get to permanent pools
    # and other stuff where inter-collection ordering actually matters, we need to add a lot of logic for handling
    # these.
    sort_order: Mapped[int] = mapped_column(Integer(), nullable=True)
    parent_id: Mapped[int | None] = mapped_column(
        ForeignKey("PoolMember.id", onupdate="CASCADE", ondelete="CASCADE"), default=None, nullable=True
    )

    parent: Mapped[PoolMember] = relationship(lazy="joined", remote_side=[id], back_populates="children")
    children: Mapped[list[PoolMember]] = relationship(
        lazy="joined", back_populates="parent", order_by="PoolMember.sort_order"
    )
    randomization_parameters: Mapped[PoolMemberRandomizationParameters] = relationship(
        lazy="joined", back_populates="pool_member"
    )


class PoolMemberRandomizationParameters(EntityBase):
    pool_member_id: Mapped[int] = mapped_column(
        ForeignKey("PoolMember.id", ondelete="CASCADE", onupdate="CASCADE"), primary_key=True
    )

    weight: Mapped[float] = mapped_column(Float(), default=0, nullable=False)  # [-1, 1]
    skips_since_last_play: Mapped[int] = mapped_column(Integer(), default=0, nullable=False)

    pool_member: Mapped[PoolMember] = relationship(lazy="joined", back_populates="randomization_parameters")


class Pool(EntityBase):
    id: Mapped[int] = mapped_column(Integer(), primary_key=True, autoincrement=True)
    name: Mapped[str | None] = mapped_column(String(32), nullable=True)  # Name null -> user transient pool
    owner_user_id: Mapped[str] = mapped_column(ForeignKey("User.spotify_id"), nullable=False)

    joined_users: Mapped[list[PoolJoinedUser]] = relationship(lazy="joined", back_populates="pool")
    share_data: Mapped[PoolShareData] = relationship(lazy="joined", back_populates="pool")

    owner_user: Mapped[User] = relationship(back_populates="own_transient_pool")


class PoolShareData(EntityBase):
    pool_id: Mapped[int] = mapped_column(
        ForeignKey("Pool.id", onupdate="CASCADE", ondelete="CASCADE"), primary_key=True
    )
    code: Mapped[str] = mapped_column(String(8), nullable=False)

    pool: Mapped[Pool] = relationship(lazy="joined", back_populates="share_data")


class PoolJoinedUser(EntityBase):
    user_id: Mapped[str] = mapped_column(ForeignKey("User.spotify_id"), primary_key=True)
    pool_id: Mapped[int] = mapped_column(ForeignKey("Pool.id", onupdate="CASCADE", ondelete="CASCADE"), nullable=False)
    promoted_track_id: Mapped[int] = mapped_column(
        ForeignKey("PoolMember.id", onupdate="CASCADE", ondelete="CASCADE"), nullable=True
    )

    pool: Mapped[Pool] = relationship(lazy="joined", back_populates="joined_users")
    user: Mapped[User] = relationship(lazy="joined", back_populates="joined_pool")
    promoted_track: Mapped[PoolMember] = relationship(lazy="joined")


class PlaybackSession(EntityBase):
    user_id: Mapped[str] = mapped_column(ForeignKey("User.spotify_id"), primary_key=True)
    current_track_id: Mapped[int | None] = mapped_column(
        ForeignKey("PoolMember.id", ondelete="SET NULL"), nullable=True
    )
    is_active: Mapped[bool] = mapped_column(Boolean(), default=True, nullable=False)
    next_song_change_timestamp: Mapped[datetime.datetime] = mapped_column(DateTime)

    # We cache these here, as deleting the active pool member and using a relationship to get its data causes issues
    current_track_uri: Mapped[str | None] = mapped_column(String(128), nullable=True)
    current_track_name: Mapped[str | None] = mapped_column(String(128), nullable=True)
    current_track_image_url: Mapped[str | None] = mapped_column(String(256), nullable=True)
    current_track_duration_ms: Mapped[int | None] = mapped_column(Integer(), nullable=True)

    current_track: Mapped[PoolMember] = relationship()


class PlayedPoolMember(EntityBase):
    id: Mapped[int] = mapped_column(Integer(), primary_key=True, autoincrement=True)
    joined_user_id: Mapped[str] = mapped_column(ForeignKey("PoolJoinedUser.user_id"))
    pool_member_id: Mapped[str] = mapped_column(ForeignKey("PoolMember.id"))

    played_time_ms: Mapped[int] = mapped_column(Integer(), nullable=False)
