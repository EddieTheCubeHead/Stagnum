from typing import Annotated

from fastapi import Depends

from api.common.dependencies import DatabaseConnection
from database.entities import LoginState


class AuthDatabaseConnectionRaw:
    def __init__(self, database_connection: DatabaseConnection):
        self._database_connection = database_connection

    def save_state(self, state_string: str):
        with self._database_connection.session() as session:
            new_state = LoginState(state_string=state_string)
            session.add(new_state)


AuthDatabaseConnection = Annotated[AuthDatabaseConnectionRaw, Depends()]
