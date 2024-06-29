import os
from logging import getLogger
from pathlib import Path

from logging_config import setup_logging

setup_logging()  # out of order because importing uvicorn fires off logger events

import locale  # noqa: E402 - we need to set up logging before these

import uvicorn  # noqa: E402 - we need to set up logging before these

_logger = getLogger("main.main")


def _inject_secret(secret_name: str) -> None:
    env_name = secret_name.upper()
    if os.getenv(env_name) is None:
        _logger.info(f"Environment variable {env_name} not found! Getting from secret file.")
        path = Path(f"/run/secrets/{secret_name}")
        with path.open("r", encoding=locale.getpreferredencoding(do_setlocale=False)) as secret_file:
            secret = secret_file.read()
            os.environ[env_name] = secret
            _logger.info(f"Setting environment variable {env_name} from file {secret_name}")


def _inject_secrets() -> None:
    secret_files = ["spotify_client_id", "spotify_client_secret"]
    _logger.debug(f"Injecting secrets from the following files: {secret_files}")
    for secret_file in secret_files:
        _inject_secret(secret_file)


if __name__ == "__main__":
    _inject_secrets()
    uvicorn.run(
        "api.application:create_app",
        host=os.getenv("HOST", default="127.0.0.1"),
        port=int(os.getenv("PORT", default="8080")),
        reload=bool(os.getenv("RELOAD", "True")),
        factory=True,
        log_config=None,
    )
