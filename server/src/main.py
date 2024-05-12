import os
from logging import getLogger

from api.common.helpers import _get_allowed_origins
from logging_config import setup_logging

setup_logging()  # out of order because importing uvicorn fires off logger events

import locale

import uvicorn

_logger = getLogger("main.main")


def _inject_secret(secret_name: str) -> None:
    env_name = secret_name.upper()
    if os.getenv(env_name) is None:
        _logger.debug(f"Environment variable {env_name} not found! Getting from secret file.")
        with open(f"/run/secrets/{secret_name}", encoding=locale.getpreferredencoding(False)) as secret_file:
            secret = secret_file.read()
            os.environ[env_name] = secret
            _logger.debug(f"Setting environment variable {env_name} from file {secret_name}")


def _inject_secrets() -> None:
    secret_files = ["spotify_client_id", "spotify_client_secret"]
    _logger.debug(f"Injecting secrets from the following files: {secret_files}")
    for secret_file in secret_files:
        _inject_secret(secret_file)


def _check_cors() -> None:
    all_allowed_cors = _get_allowed_origins()
    _logger.info(f"Allowed CORS origins: {all_allowed_cors}")


if __name__ == "__main__":
    _inject_secrets()
    _check_cors()
    uvicorn.run(
        "api.application:create_app",
        host=os.getenv("HOST", default="127.0.0.1"),
        port=int(os.getenv("PORT", default="8080")),
        reload=bool(os.getenv("RELOAD", "True")),
        factory=True,
        log_config=None,
    )
