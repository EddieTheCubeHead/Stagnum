import functools
import json
from typing import Annotated

import requests
from fastapi import Depends, HTTPException, Header
from requests import Response

from database.database_connection import ConnectionManager
from database.entities import User


class RequestsClientRaw:
    """A class to enable easy mocking of requests functionality with FastAPI dependency system.

    Only houses wrapper functions for requests calls, no actual logic should ever reside here, as this class won't
    get any test coverage due to always being mocked in tests.
    """

    @functools.wraps(requests.get)
    def get(self, *args, **kwargs):
        return requests.get(*args, **kwargs)

    @functools.wraps(requests.post)
    def post(self, *args, **kwargs):
        return requests.post(*args, **kwargs)


RequestsClient = Annotated[RequestsClientRaw, Depends()]


def _validate_data(raw_data: Response) -> dict:
    parsed_data = json.loads(raw_data.content.decode("utf8"))
    if raw_data.status_code != 200:
        raise HTTPException(status_code=raw_data.status_code, detail=parsed_data["error"])
    return parsed_data


class SpotifyClientRaw:
    def __init__(self, request_client: RequestsClient):
        self._request_client = request_client

    def get(self, query: str, *args, override_base_url: str = None, **kwargs) -> Response:
        url = "https://api.spotify.com/v1/" if override_base_url is None else override_base_url
        return self._request_client.get(f"{url}{query}", *args, **kwargs)

    def post(self, query: str, *args, override_base_url: str = None, **kwargs) -> Response:
        url = "https://api.spotify.com/v1/" if override_base_url is None else override_base_url
        return self._request_client.post(f"{url}{query}", *args, **kwargs)


SpotifyClient = Annotated[SpotifyClientRaw, Depends()]


DatabaseConnection = Annotated[ConnectionManager, Depends()]


class TokenHolderRaw:

    def __init__(self):
        self._tokens: dict[str, User] = {}

    def add_token(self, token: str, user: User):
        self._tokens[token] = user

    def validate_token(self, token: str):
        if token not in self._tokens:
            raise HTTPException(status_code=403, detail="Invalid bearer token!")

    def get_user(self, token: str) -> User:
        return self._tokens[token]


TokenHolder = Annotated[TokenHolderRaw, Depends()]


def validated_token_raw(token: Annotated[str, Header()], token_holder: TokenHolder):
    token_holder.validate_token(token)
    return token


validated_token = Annotated[str, Depends(validated_token_raw)]
