import base64
import json
from datetime import datetime
from logging import getLogger
from typing import Annotated

from fastapi import Depends, HTTPException
from requests import Response
from sqlalchemy import delete, select

from api.auth.models import SpotifyTokenResponse
from api.common.dependencies import DatabaseConnection, SpotifyClient
from database.entities import LoginState, User


_logger = getLogger("main.api.auth.dependencies")


class AuthDatabaseConnectionRaw:
    def __init__(self, database_connection: DatabaseConnection):
        self._database_connection = database_connection

    def save_state(self, state_string: str):
        _logger.debug(f"Saving state string {state_string} to database")
        with self._database_connection.session() as session:
            new_state = LoginState(state_string=state_string)
            session.add(new_state)

    def delete_expired_states(self, delete_before: datetime):
        _logger.debug(f"Deleting state strings created before {delete_before}")
        with self._database_connection.session() as session:
            session.execute(delete(LoginState).where(LoginState.insert_time_stamp < delete_before))

    def is_valid_state(self, state_string: str) -> bool:
        with self._database_connection.session() as session:
            return session.scalar(select(LoginState).where(LoginState.state_string == state_string)) is not None

    def update_logged_in_user(self, user: User, state: str):
        _logger.debug(f"Updating user data for user {user}")
        with self._database_connection.session() as session:
            existing_user = session.scalar(select(User).where(User.spotify_id == user.spotify_id))
            if existing_user is not None:
                if existing_user.spotify_username != user.spotify_username:
                    existing_user.spotify_username = user.spotify_username
                if existing_user.spotify_avatar_url != user.spotify_avatar_url:
                    existing_user.spotify_avatar_url = user.spotify_avatar_url
            else:
                session.add(user)
            state = session.scalar(select(LoginState).where(LoginState.state_string == state))
            session.delete(state)


AuthDatabaseConnection = Annotated[AuthDatabaseConnectionRaw, Depends()]


def _validate_data(raw_data: Response) -> dict:
    parsed_data = json.loads(raw_data.content.decode("utf8"))
    if raw_data.status_code != 200:
        raise HTTPException(status_code=raw_data.status_code, detail=parsed_data["error"])
    return parsed_data


class AuthSpotifyClientRaw:

    def __init__(self, spotify_client: SpotifyClient):
        self._spotify_client = spotify_client

    def get_token(self, code: str, client_id: str, client_secret: str, redirect_uri: str):
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
        parsed_data = _validate_data(data)
        return SpotifyTokenResponse(access_token=parsed_data["access_token"], token_type=parsed_data["token_type"],
                                    expires_in=parsed_data["expires_in"], refresh_token=parsed_data["refresh_token"])

    def get_me(self, token: str):
        headers = {
            "Authorization": token
        }
        data = self._spotify_client.get("me", headers=headers)
        parsed_data = json.loads(data.content.decode("utf8"))
        user_avatar_url = parsed_data["images"][0]["url"] if len(parsed_data["images"]) > 0 else None
        return User(spotify_id=parsed_data["id"], spotify_username=parsed_data["display_name"],
                    spotify_avatar_url=user_avatar_url)


AuthSpotifyClient = Annotated[AuthSpotifyClientRaw, Depends()]
