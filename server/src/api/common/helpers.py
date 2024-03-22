import random
import string
from logging import getLogger

from api.common.models import UserModel
from database.entities import User

_logger = getLogger("main.api.common.helpers")


def get_sharpest_icon(icons: list[dict]) -> str:
    _logger.debug(f"Finding sharpest icon from {icons}")
    max_size = icons[0]["height"] if icons[0]["height"] is not None else 0
    biggest_icon = icons[0]["url"]
    for icon in icons:
        if (icon["height"] or 0) > max_size:
            max_size = icon["height"]
            biggest_icon = icon["url"]
    _logger.debug(f"Found icon with height {max_size} and url '{biggest_icon}'")
    return biggest_icon


def map_user_entity_to_model(user_entity: User) -> UserModel:
    return UserModel(display_name=user_entity.spotify_username, icon_url=user_entity.spotify_avatar_url,
                     spotify_id=user_entity.spotify_id)


def build_auth_header(user: User) -> dict:
    return {
        "Authorization": user.session.user_token
    }


def create_random_string(length: int) -> str:
    chars = string.ascii_letters + string.digits
    return "".join(random.choice(chars) for _ in range(length))
