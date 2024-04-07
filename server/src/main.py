import os
from logging import getLogger

from logging_config import setup_logging

setup_logging()  # out of order because importing uvicorn fires off logger events

import uvicorn


_logger = getLogger("main.main")


def _inject_secret(secret_name: str):
    env_name = secret_name.upper()
    if os.getenv(env_name) is None:
        _logger.debug(f"Environment variable {env_name} not found! Getting from secret file.")
        with open(f"/run/secrets/{secret_name}") as secret_file:
            secret = secret_file.read()
            _logger.debug(f"Setting environment variable {env_name} from file {secret_name} as {secret}")
            os.environ[env_name] = secret


def _inject_secrets():
    secret_files = ["spotify_client_id", "spotify_client_secret"]
    _logger.debug(f"Injecting secrets from the following files: {secret_files}")
    for secret_file in secret_files:
        _inject_secret(secret_file)


if __name__ == "__main__":
    _inject_secrets()
    uvicorn.run("api.application:create_app",
                host=os.getenv("HOST", default="127.0.0.1"),
                port=int(os.getenv("PORT", default="8000")),
                reload=bool(os.getenv("RELOAD", "True")),
                factory=True, log_config=None)
