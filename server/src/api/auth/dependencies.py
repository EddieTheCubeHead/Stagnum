from datetime import datetime
from typing import Annotated

from fastapi import Depends
from sqlalchemy import delete, select

from api.common.dependencies import DatabaseConnection
from database.entities import LoginState, User


class AuthDatabaseConnectionRaw:
    def __init__(self, database_connection: DatabaseConnection):
        self._database_connection = database_connection

    def save_state(self, state_string: str):
        with self._database_connection.session() as session:
            new_state = LoginState(state_string=state_string)
            session.add(new_state)

    def delete_expired_states(self, delete_before: datetime):
        with self._database_connection.session() as session:
            session.execute(delete(LoginState).where(LoginState.insert_time_stamp < delete_before))

    def is_valid_state(self, state_string: str) -> bool:
        with self._database_connection.session() as session:
            return session.scalar(select(LoginState).where(LoginState.state_string == state_string)) is not None

    def update_logged_in_user(self, user: User, state: str):
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
