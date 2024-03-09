import functools
from logging import getLogger
from typing import Annotated

import requests
from fastapi import Depends, HTTPException, Header
from requests import Response

from database.database_connection import ConnectionManager
from database.entities import User


_logger = getLogger("main.api.common.dependencies")


class RequestsClientRaw:
    """A class to enable easy mocking of requests functionality with FastAPI dependency system.

    Only houses wrapper functions for requests calls, no actual logic should ever reside here, as this class won't
    get any test coverage due to always being mocked in tests.
    """

    @functools.wraps(requests.get)
    def get(self, *args, **kwargs):
        _logger.debug(f"GET: {args} {kwargs}")
        result = requests.get(*args, **kwargs)
        _logger.info(f"Call result: {result.status_code} ; "
                     f"{result.content[:256]}{"..." if len(result.content) > 256 else ""}")
        return result

    @functools.wraps(requests.post)
    def post(self, *args, **kwargs):
        _logger.debug(f"POST: {args} {kwargs}")
        result = requests.post(*args, **kwargs)
        _logger.info(f"Call result: {result.status_code} ; "
                     f"{result.content[:256]}{"..." if len(result.content) > 256 else ""}")
        return result

    @functools.wraps(requests.put)
    def put(self, *args, **kwargs):
        _logger.debug(f"PUT {args} {kwargs}")
        result = requests.put(*args, **kwargs)
        _logger.info(f"Call result: {result.status_code} ; "
                     f"{result.content[:256]}{"..." if len(result.content) > 256 else ""}")
        return result


RequestsClient = Annotated[RequestsClientRaw, Depends()]


class SpotifyClientRaw:
    def __init__(self, request_client: RequestsClient):
        self._request_client = request_client

    def get(self, query: str = None, *args, override_url: str = None, **kwargs) -> Response:
        query = f"https://api.spotify.com/v1/{query}" if override_url is None else override_url
        _logger.info(f"Calling spotify API at GET {query} with args: {args} and kwargs: {kwargs}")
        return self._request_client.get(f"{query}", *args, **kwargs)

    def post(self, query: str = None, *args, override_url: str = None, **kwargs) -> Response:
        query = f"https://api.spotify.com/v1/{query}" if override_url is None else override_url
        _logger.info(f"Calling spotify API at POST {query} with args: {args} and kwargs: {kwargs}")
        return self._request_client.post(f"{query}", *args, **kwargs)

    def put(self, query: str = None, *args, override_url: str = None, **kwargs) -> Response:
        query = f"https://api.spotify.com/v1/{query}" if override_url is None else override_url
        _logger.info(f"Calling spotify API at PUT {query} with args: {args} and kwargs: {kwargs}")
        return self._request_client.put(f"{query}", *args, **kwargs)


SpotifyClient = Annotated[SpotifyClientRaw, Depends()]


DatabaseConnection = Annotated[ConnectionManager, Depends()]


class TokenHolderRaw:

    _tokens: dict[str, User] = {}
    _user_tokens: dict[str, str] = {}

    def add_token(self, token: str, user: User):
        self._tokens[token] = user
        self._user_tokens[user.spotify_id] = token

    def validate_token(self, token: str):
        if not self.is_token_logged_in(token):
            _logger.error(f"Token {token} not found in {self._tokens}")
            raise HTTPException(status_code=403, detail="Invalid bearer token!")

    def get_from_token(self, token: str) -> User:
        return self._tokens[token]

    def get_from_user_id(self, user_id: str) -> str:
        return self._user_tokens[user_id]

    def log_out(self, token: str):
        user_id = self._tokens.pop(token).spotify_id
        self._user_tokens.pop(user_id)

    def is_token_logged_in(self, token: str):
        return token in self._tokens

    def is_user_logged_in(self, user_id: str):
        return user_id in self._user_tokens


TokenHolder = Annotated[TokenHolderRaw, Depends()]


def validated_token_raw(token: Annotated[str, Header()], token_holder: TokenHolder):
    _logger.debug(f"Validating token {token}")
    token_holder.validate_token(token)
    return token


validated_token = Annotated[str, Depends(validated_token_raw)]
