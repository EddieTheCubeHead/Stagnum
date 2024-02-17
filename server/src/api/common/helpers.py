from logging import getLogger

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
