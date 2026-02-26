import os
import random
import string
from logging import getLogger
from typing import Never

from fastapi import HTTPException

from api.common.models import PoolJoinedUser, UserModel
from api.common.spotify_models import ImageData
from database.entities import User

_logger = getLogger("main.api.common.helpers")


def get_sharpest_icon(icons: list[ImageData]) -> str | None:
    _logger.debug(f"Finding sharpest icon from {icons}")
    if len(icons) == 0:
        return None
    max_size = icons[0]["height"] if icons[0]["height"] is not None else 0
    biggest_icon = icons[0]["url"]
    for icon in icons:
        if (icon["height"] or 0) > max_size:
            max_size = icon["height"]
            biggest_icon = icon["url"]
    _logger.debug(f"Found icon with height {max_size} and url '{biggest_icon}'")
    return biggest_icon


def map_user_entity_to_model(user_entity: User) -> UserModel:
    return UserModel(
        display_name=user_entity.spotify_username,
        icon_url=user_entity.spotify_avatar_url,
        spotify_id=user_entity.spotify_id,
    )


def map_user_entity_to_joined_user_model(user_entity: User) -> PoolJoinedUser:
    return PoolJoinedUser(
        display_name=user_entity.spotify_username,
        icon_url=user_entity.spotify_avatar_url,
        spotify_id=user_entity.spotify_id,
        promoted_track_id=user_entity.joined_pool.promoted_track_id,
    )


def build_auth_header(user: User) -> dict:
    return {"Authorization": user.session.user_token}


def create_random_string(length: int) -> str:
    chars = string.ascii_letters + string.digits
    return "".join(random.choice(chars) for _ in range(length))


def raise_internal_server_error(message: str) -> Never:
    environment = get_environment()
    if environment == "production":
        message = "Internal server error"
    raise HTTPException(status_code=500, detail=message)


def _get_client_id() -> str:
    client_id = os.getenv("SPOTIFY_CLIENT_ID", default=None)
    if client_id is None:
        raise_internal_server_error("Could not find spotify client ID in environment variables")
    return client_id


def _get_client_secret() -> str:
    client_secret = os.getenv("SPOTIFY_CLIENT_SECRET", default=None)
    if client_secret is None:
        raise_internal_server_error("Could not find spotify client secret in environment variables")
    return client_secret


def get_environment() -> str:
    return os.getenv("ENVIRONMENT", default="production").lower()


def _get_allowed_origins() -> list[str]:
    raw_environment_value = os.getenv("CORS_ORIGINS", default="http://localhost")
    return raw_environment_value.split(",")
