import functools
import json
from logging import getLogger
from typing import Annotated

import requests
from fastapi import Depends, HTTPException, Header
from fastapi import Response as FastAPIResponse
from requests import Response as RequestsResponse
from sqlalchemy import select

from database.database_connection import ConnectionManager
from database.entities import User, UserSession

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


def _validate_and_decode(response: RequestsResponse) -> dict:
    parsed_data = json.loads(response.content.decode("utf8"))
    if response.status_code >= 400:
        error_message = (f"Error code {response.status_code} received while calling Spotify API. "
                         f"Message: {parsed_data["error"]}")
        raise HTTPException(status_code=502, detail=error_message)
    return parsed_data


class SpotifyClientRaw:
    def __init__(self, request_client: RequestsClient):
        self._request_client = request_client

    def get(self, query: str = None, *args, override_url: str = None, **kwargs) -> dict:
        query = f"https://api.spotify.com/v1/{query}" if override_url is None else override_url
        _logger.info(f"Calling spotify API at GET {query} with args: {args} and kwargs: {kwargs}")
        raw_response = self._request_client.get(f"{query}", *args, **kwargs)
        return _validate_and_decode(raw_response)

    def post(self, query: str = None, *args, override_url: str = None, **kwargs) -> dict:
        query = f"https://api.spotify.com/v1/{query}" if override_url is None else override_url
        _logger.info(f"Calling spotify API at POST {query} with args: {args} and kwargs: {kwargs}")
        raw_response = self._request_client.post(f"{query}", *args, **kwargs)
        return _validate_and_decode(raw_response)

    def put(self, query: str = None, *args, override_url: str = None, **kwargs):
        query = f"https://api.spotify.com/v1/{query}" if override_url is None else override_url
        _logger.info(f"Calling spotify API at PUT {query} with args: {args} and kwargs: {kwargs}")
        raw_response = self._request_client.put(f"{query}", *args, **kwargs)
        return _validate_and_decode(raw_response)


SpotifyClient = Annotated[SpotifyClientRaw, Depends()]

DatabaseConnection = Annotated[ConnectionManager, Depends()]


class UserDatabaseConnectionRaw:

    def __init__(self, database_connection: DatabaseConnection):
        self._database_connection = database_connection

    def get_from_token(self, token: str) -> User | None:
        with self._database_connection.session() as session:
            return session.scalar(select(User).where(User.session.has(UserSession.user_token == token)))

    def get_from_id(self, user_id: str) -> User | None:
        with self._database_connection.session() as session:
            return session.scalar(select(User).where(User.spotify_id == user_id))

    def log_out(self, token: str):
        with self._database_connection.session() as session:
            user = session.scalar(select(User).where(User.session.has(UserSession.user_token == token)))
            session.delete(user.session)


UserDatabaseConnection = Annotated[UserDatabaseConnectionRaw, Depends()]


class TokenHolderRaw:

    def __init__(self, user_database_connection: UserDatabaseConnection, response: FastAPIResponse):
        self._user_database_connection = user_database_connection
        self._response = response

    def get_user_from_token(self, token: str) -> User:
        user = self._user_database_connection.get_from_token(token)
        self._ensure_fresh_token(user)
        if user is None:
            _logger.error(f"Token {token} not found.")
            raise HTTPException(status_code=403, detail="Invalid bearer token!")
        return user

    def get_user_from_user_id(self, user_id: str) -> User:
        user = self._user_database_connection.get_from_id(user_id)
        return user

    def log_out(self, token: str):
        self._user_database_connection.log_out(token)

    def is_token_logged_in(self, token: str):
        return self._user_database_connection.get_from_token(token) is not None

    def is_user_logged_in(self, user_id: str):
        return self._user_database_connection.get_from_id(user_id).session is not None

    def _ensure_fresh_token(self, user: User):
        if self._response is not None:
            self._response.headers["Authorization"] = user.session.user_token


TokenHolder = Annotated[TokenHolderRaw, Depends()]


# Authorization is read case-sensitively from headers and needs to be capitalized
# noinspection PyPep8Naming
def validated_user_raw(Authorization: Annotated[str, Header()], token_holder: TokenHolder) -> User:
    return _get_user_from_token(Authorization, token_holder)


validated_user = Annotated[User, Depends(validated_user_raw)]


# Authorization is read case-sensitively from headers and needs to be capitalized
# noinspection PyPep8Naming
def validated_user_from_query_parameters_raw(Authorization: str, token_holder: TokenHolder) -> User:
    return _get_user_from_token(Authorization, token_holder)


validated_user_from_query_parameters = Annotated[User, Depends(validated_user_from_query_parameters_raw)]


def _get_user_from_token(token: str, token_holder: TokenHolder) -> User:
    _logger.debug(f"Getting user for token {token}")
    user = token_holder.get_user_from_token(token)
    return user
