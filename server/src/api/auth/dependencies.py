from datetime import datetime
from typing import Annotated

from fastapi import Depends
from sqlalchemy import delete, select

from api.common.dependencies import DatabaseConnection
from database.entities import LoginState


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


AuthDatabaseConnection = Annotated[AuthDatabaseConnectionRaw, Depends()]
