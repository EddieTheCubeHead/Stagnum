import base64
import datetime
import os
from logging import getLogger
from typing import Annotated

from fastapi import Depends, HTTPException
from sqlalchemy import delete, select

from api.auth.models import SpotifyTokenResponse, LoginRedirect, LoginSuccess
from api.common.dependencies import DatabaseConnection, SpotifyClient, TokenHolder
from api.common.helpers import create_random_string, raise_internal_server_error
from api.common.models import ParsedTokenResponse
from database.entities import LoginState, User, UserSession

_logger = getLogger("main.api.auth.dependencies")


class AuthDatabaseConnectionRaw:
    def __init__(self, database_connection: DatabaseConnection):
        self._database_connection = database_connection

    def save_state(self, state_string: str):
        _logger.debug(f"Saving state string {state_string} to database")
        with self._database_connection.session() as session:
            new_state = LoginState(state_string=state_string)
            session.add(new_state)

    def delete_expired_states(self, delete_before: datetime.datetime):
        _logger.debug(f"Deleting state strings created before {delete_before}")
        with self._database_connection.session() as session:
            session.execute(delete(LoginState).where(LoginState.insert_time_stamp < delete_before))

    def is_valid_state(self, state_string: str) -> bool:
        with self._database_connection.session() as session:
            return session.scalar(select(LoginState).where(LoginState.state_string == state_string)) is not None

    def update_logged_in_user(self, user: User, token_result: ParsedTokenResponse, state: str = None):
        _logger.debug(f"Updating user data for user {user}")
        with self._database_connection.session() as session:
            user.session = UserSession(user_token=token_result.token, refresh_token=token_result.refresh_token,
                                       expires_at=datetime.datetime.now() + datetime.timedelta(
                                           seconds=token_result.expires_in))
            session.merge(user)
            if state is None:
                return
            state = session.scalar(select(LoginState).where(LoginState.state_string == state))
            session.delete(state)


AuthDatabaseConnection = Annotated[AuthDatabaseConnectionRaw, Depends()]


_ALLOWED_PRODUCT_TYPES = {"premium"}


class AuthSpotifyClientRaw:

    def __init__(self, spotify_client: SpotifyClient):
        self._spotify_client = spotify_client

    def get_token(self, code: str, client_id: str, client_secret: str, redirect_uri: str) -> SpotifyTokenResponse:
        form = {
            "code": code,
            "redirect_uri": redirect_uri,
            "grant_type": "authorization_code"
        }
        token = base64.b64encode((client_id + ':' + client_secret).encode('ascii')).decode('ascii')
        headers = {
            "Authorization": "Basic " + token,
            "Content-Type": "application/x-www-form-urlencoded"
        }

        data = self._spotify_client.post(override_url="https://accounts.spotify.com/api/token", headers=headers,
                                         data=form)
        return SpotifyTokenResponse(access_token=data["access_token"], token_type=data["token_type"],
                                    expires_in=data["expires_in"], refresh_token=data["refresh_token"])

    def get_me(self, token: str):
        headers = {
            "Authorization": token
        }
        data = self._spotify_client.get("me", headers=headers)
        if data["product"] not in _ALLOWED_PRODUCT_TYPES:
            raise HTTPException(status_code=401,
                                detail="You need to have a Spotify Premium subscription to use Stagnum!")
        user_avatar_url = data["images"][0]["url"] if len(data["images"]) > 0 else None
        return User(spotify_id=data["id"], spotify_username=data["display_name"],
                    spotify_avatar_url=user_avatar_url)


AuthSpotifyClient = Annotated[AuthSpotifyClientRaw, Depends()]

_required_scopes = [
    "user-read-playback-state",
    "user-modify-playback-state",
    "user-read-private",
    "user-read-email"
]


def _get_client_id():
    client_id = os.getenv("SPOTIFY_CLIENT_ID", default=None)
    if client_id is None:
        raise_internal_server_error("Could not find spotify client ID in environment variables")
    return client_id


def _get_client_secret():
    client_secret = os.getenv("SPOTIFY_CLIENT_SECRET", default=None)
    if client_secret is None:
        raise_internal_server_error("Could not find spotify client secret in environment variables")
    return client_secret


class AuthServiceRaw:

    def __init__(self, spotify_client: AuthSpotifyClient, database_connection: AuthDatabaseConnection,
                 token_holder: TokenHolder):
        self._spotify_client = spotify_client
        self._database_connection = database_connection
        self._token_holder = token_holder

    def build_redirect(self, client_redirect_uri: str) -> LoginRedirect:
        base_url = "https://accounts.spotify.com/authorize?"
        scopes_string = " ".join(_required_scopes)
        state = create_random_string(16)
        self._database_connection.save_state(state)
        client_id = _get_client_id()
        return LoginRedirect(redirect_uri=f"{base_url}scope={scopes_string}&state={state}&response_type=code"
                                          f"&redirect_uri={client_redirect_uri}&client_id={client_id}")

    def get_token(self, state: str, code: str, client_redirect_uri: str) -> LoginSuccess:
        self._validate_state(state)
        token_result = self._fetch_token(client_redirect_uri, code)
        me_result = self._fetch_current_user(token_result.token)
        self._database_connection.update_logged_in_user(me_result, token_result, state)
        return LoginSuccess(access_token=token_result.token)

    def _validate_state(self, state):
        if not self._database_connection.is_valid_state(state):
            _logger.error(f"Invalid login attempt! Did not find state string that matches state {state}.")
            error_message = ("Login state is invalid or expired. "
                             "Please restart the login flow to ensure a fresh and valid state.")
            raise HTTPException(status_code=403, detail=error_message)

    def _fetch_token(self, client_redirect_uri, code) -> ParsedTokenResponse:
        client_id = _get_client_id()
        client_secret = _get_client_secret()
        _logger.debug(f"Fetching oauth auth token from spotify")
        token_result = self._spotify_client.get_token(code, client_id, client_secret, client_redirect_uri)
        token = f"{token_result.token_type} {token_result.access_token}"
        return ParsedTokenResponse(token=token, refresh_token=token_result.refresh_token,
                                   expires_in=token_result.expires_in)

    def _fetch_current_user(self, token) -> User:
        _logger.debug(f"Fetching user data from spotify")
        me_result = self._spotify_client.get_me(token)
        return me_result


AuthService = Annotated[AuthServiceRaw, Depends()]
