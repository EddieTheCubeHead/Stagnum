import base64
import datetime
import functools
import json
from json import JSONDecodeError
from logging import getLogger
from typing import Annotated, Any, Optional

import requests
from fastapi import Depends, Header, HTTPException
from fastapi import Response as FastAPIResponse
from requests import Response as RequestsResponse
from sqlalchemy import or_, select
from starlette import status

from api.common.helpers import _get_client_id, _get_client_secret
from api.common.models import SpotifyTokenResponse
from api.common.spotify_models import RefreshTokenData, RequestTokenData
from database.database_connection import ConnectionManager
from database.entities import User, UserSession

_logger = getLogger("main.api.common.dependencies")


class DateTimeWrapperRaw:  # pragma: no cover - we're always mocking this class
    """Wrapper for all datetime functionality. Ensures we can mock now() in testing"""

    def __init__(self) -> None:
        self._timezone = datetime.timezone.utc

    def now(self) -> datetime.datetime:
        return datetime.datetime.now(self._timezone)

    def ensure_utc(self, timestamp: datetime.datetime) -> datetime.datetime:
        return timestamp.replace(tzinfo=self._timezone)


DateTimeWrapper = Annotated[DateTimeWrapperRaw, Depends()]


class RequestsClientRaw:  # pragma: no cover - we're always mocking this class
    """A class to enable easy mocking of requests functionality with FastAPI dependency system.

    Only houses wrapper functions for requests calls, no actual logic should ever reside here, as this class won't
    get any test coverage due to always being mocked in tests.
    """

    _LINE_CUTOFF = 256

    @functools.wraps(requests.get)
    def get(self, *args, **kwargs) -> requests.Response:  # noqa: ANN002, ANN003 - passed straight into requests
        _logger.debug(f"GET: {args} {kwargs}")
        result = requests.get(*args, **kwargs)
        _logger.info(
            f"Call result: {result.status_code} ; "
            f"{result.content[: self._LINE_CUTOFF]}{'...' if len(result.content) > self._LINE_CUTOFF else ''}"
        )
        return result

    @functools.wraps(requests.post)
    def post(self, *args, **kwargs) -> requests.Response:  # noqa: ANN002, ANN003 - passed straight into requests
        _logger.debug(f"POST: {args} {kwargs}")
        result = requests.post(*args, **kwargs)
        _logger.info(
            f"Call result: {result.status_code} ; "
            f"{result.content[: self._LINE_CUTOFF]}{'...' if len(result.content) > self._LINE_CUTOFF else ''}"
        )
        return result

    @functools.wraps(requests.put)
    def put(self, *args, **kwargs) -> requests.Response:  # noqa: ANN002, ANN003 - passed straight into requests
        _logger.debug(f"PUT {args} {kwargs}")
        result = requests.put(*args, **kwargs)
        _logger.info(
            f"Call result: {result.status_code} ; "
            f"{result.content[: self._LINE_CUTOFF]}{'...' if len(result.content) > self._LINE_CUTOFF else ''}"
        )
        return result


RequestsClient = Annotated[RequestsClientRaw, Depends()]


def _validate_and_decode(response: RequestsResponse) -> dict[str, Any] | None:
    response_string = response.content.decode("utf8")
    try:
        parsed_data = json.loads(response_string) if response_string else None
    # For some reason POST /me/player/queue sometimes returns 200 with raw text content - what?
    # Anyway this try except handles that singular edge case - all other spotify responses are proper json
    except JSONDecodeError:
        parsed_data = None
    if response.status_code >= status.HTTP_400_BAD_REQUEST:
        error_message = (
            f"Error code {response.status_code} received while calling Spotify API. Message: {parsed_data['error']}"
        )
        raise HTTPException(status_code=502, detail=error_message)
    return parsed_data


class SpotifyClientRaw:
    def __init__(self, request_client: RequestsClient) -> None:
        self._request_client = request_client

    def get(
        self, query: Optional[str] = None, *args: str, override_url: Optional[str] = None, **kwargs: dict[str, str]
    ) -> dict[str, Any] | None:
        query = f"https://api.spotify.com/v1/{query}" if override_url is None else override_url
        _logger.info(f"Calling spotify API at GET {query} with args: {args} and kwargs: {kwargs}")
        raw_response = self._request_client.get(f"{query}", *args, **kwargs)
        return _validate_and_decode(raw_response)

    def post(
        self, query: Optional[str] = None, *args: str, override_url: Optional[str] = None, **kwargs: dict[str, str]
    ) -> dict[str, Any] | None:
        query = f"https://api.spotify.com/v1/{query}" if override_url is None else override_url
        _logger.info(f"Calling spotify API at POST {query} with args: {args} and kwargs: {kwargs}")
        raw_response = self._request_client.post(f"{query}", *args, **kwargs)
        return _validate_and_decode(raw_response)

    def put(
        self, query: Optional[str] = None, *args: str, override_url: Optional[str] = None, **kwargs: dict[str, str]
    ) -> dict[str, Any] | None:
        query = f"https://api.spotify.com/v1/{query}" if override_url is None else override_url
        _logger.info(f"Calling spotify API at PUT {query} with args: {args} and kwargs: {kwargs}")
        raw_response = self._request_client.put(f"{query}", *args, **kwargs)
        return _validate_and_decode(raw_response)


SpotifyClient = Annotated[SpotifyClientRaw, Depends()]

DatabaseConnection = Annotated[ConnectionManager, Depends()]

_ALLOWED_PRODUCT_TYPES = {"premium"}


class AuthSpotifyClientRaw:
    def __init__(self, spotify_client: SpotifyClient) -> None:
        self._spotify_client = spotify_client

    def get_token(self, code: str, client_id: str, client_secret: str, redirect_uri: str) -> SpotifyTokenResponse:
        form = {"code": code, "redirect_uri": redirect_uri, "grant_type": "authorization_code"}
        return self._get_token_from_form(client_id, client_secret, form)

    def refresh_token(self, refresh_token: str, client_id: str, client_secret: str) -> SpotifyTokenResponse:
        form = {"grant_type": "refresh_token", "refresh_token": refresh_token}
        return self._get_token_from_form(client_id, client_secret, form)

    def _get_token_from_form(
        self, client_id: str, client_secret: str, form: RequestTokenData | RefreshTokenData
    ) -> SpotifyTokenResponse:
        token = base64.b64encode((client_id + ":" + client_secret).encode("ascii")).decode("ascii")
        headers = {"Authorization": "Basic " + token, "Content-Type": "application/x-www-form-urlencoded"}
        data = self._spotify_client.post(
            override_url="https://accounts.spotify.com/api/token", headers=headers, data=form
        )
        refresh_token = data["refresh_token"] if "refresh_token" in data else form["refresh_token"]
        return SpotifyTokenResponse(
            access_token=data["access_token"],
            token_type=data["token_type"],
            expires_in=data["expires_in"],
            refresh_token=refresh_token,
        )

    def get_me(self, token: str) -> User:
        headers = {"Authorization": token}
        data = self._spotify_client.get("me", headers=headers)
        if data["product"] not in _ALLOWED_PRODUCT_TYPES:
            raise HTTPException(
                status_code=401, detail="You need to have a Spotify Premium subscription to use Stagnum!"
            )
        user_avatar_url = data["images"][0]["url"] if len(data["images"]) > 0 else None
        return User(spotify_id=data["id"], spotify_username=data["display_name"], spotify_avatar_url=user_avatar_url)


AuthSpotifyClient = Annotated[AuthSpotifyClientRaw, Depends()]


class UserDatabaseConnectionRaw:
    def __init__(self, database_connection: DatabaseConnection, datetime_wrapper: DateTimeWrapper) -> None:
        self._database_connection = database_connection
        self._datetime_wrapper = datetime_wrapper

    def get_from_token(self, token: str) -> User | None:
        with self._database_connection.session() as session:
            user = session.scalar(
                select(User).where(
                    User.session.has(or_(UserSession.user_token == token, UserSession.last_login_token == token))
                )
            )
            if user is not None:
                user.session.last_login_token = token
            return user

    def get_from_id(self, user_id: str) -> User | None:
        with self._database_connection.session() as session:
            return session.scalar(select(User).where(User.spotify_id == user_id))

    def log_out(self, token: str) -> None:
        with self._database_connection.session() as session:
            user = session.scalar(select(User).where(User.session.has(UserSession.user_token == token)))
            session.delete(user.session)

    def refresh_session(self, user: User, refreshed_session: SpotifyTokenResponse) -> UserSession:
        with self._database_connection.session() as session:
            user_session = session.scalar(select(UserSession).where(UserSession.user_id == user.spotify_id))
            user_session.user_token = f"{refreshed_session.token_type} {refreshed_session.access_token}"
            user_session.refresh_token = refreshed_session.refresh_token
            user_session.expires_at = self._datetime_wrapper.now() + datetime.timedelta(
                seconds=refreshed_session.expires_in
            )

        return user_session


UserDatabaseConnection = Annotated[UserDatabaseConnectionRaw, Depends()]


class TokenHolderRaw:
    def __init__(
        self,
        user_database_connection: UserDatabaseConnection,
        auth_client: AuthSpotifyClient,
        datetime_wrapper: DateTimeWrapper,
        response: FastAPIResponse,
    ) -> None:
        self._user_database_connection = user_database_connection
        self._auth_client = auth_client
        self._datetime_wrapper = datetime_wrapper
        self._response = response

    def get_user_from_token(self, token: str) -> User:
        user = self._user_database_connection.get_from_token(token)
        if user is None:
            _logger.error(f"Token {token} not found.")
            raise HTTPException(status_code=403, detail="Invalid bearer token!")
        self._ensure_fresh_token(user)
        return user

    def get_user_from_user_id(self, user_id: str) -> User:
        user = self._user_database_connection.get_from_id(user_id)
        self._ensure_fresh_token(user)
        return user

    def log_out(self, token: str) -> None:
        self._user_database_connection.log_out(token)

    def is_user_logged_in(self, user_id: str) -> bool:
        return self._user_database_connection.get_from_id(user_id).session is not None

    def _ensure_fresh_token(self, user: User) -> None:
        user_session: UserSession = user.session
        if self._datetime_wrapper.ensure_utc(user_session.expires_at) <= self._datetime_wrapper.now():
            _logger.info(f"Refreshing token for user {user.spotify_username}")
            client_id = _get_client_id()
            client_secret = _get_client_secret()
            refreshed_session = self._auth_client.refresh_token(user_session.refresh_token, client_id, client_secret)
            user_session = self._user_database_connection.refresh_session(user, refreshed_session)
            user.session = user_session
        if self._response is not None:
            self._response.headers["Authorization"] = user_session.user_token


TokenHolder = Annotated[TokenHolderRaw, Depends()]


# Authorization is read case-sensitively from headers and needs to be capitalized
# noinspection PyPep8Naming
def validated_user_raw(Authorization: Annotated[str, Header()], token_holder: TokenHolder) -> User:  # noqa: N803
    return _get_user_from_token(Authorization, token_holder)


validated_user = Annotated[User, Depends(validated_user_raw)]


# Authorization is read case-sensitively from headers and needs to be capitalized
# noinspection PyPep8Naming
def validated_user_from_query_parameters_raw(Authorization: str, token_holder: TokenHolder) -> User:  # noqa: N803
    return _get_user_from_token(Authorization, token_holder)


validated_user_from_query_parameters = Annotated[User, Depends(validated_user_from_query_parameters_raw)]


def _get_user_from_token(token: str, token_holder: TokenHolder) -> User:
    _logger.debug(f"Getting user for token {token}")
    return token_holder.get_user_from_token(token)
