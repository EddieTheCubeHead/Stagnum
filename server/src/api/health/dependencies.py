import datetime
from typing import Annotated

from fastapi import Depends
from sqlalchemy import text
from sqlalchemy.exc import SQLAlchemyError

from api.common.dependencies import DatabaseConnection, DateTimeWrapper


class RequestTimerRaw:

    def __init__(self, datetime_wrapper: DateTimeWrapper) -> None:
        self._start_time = datetime_wrapper.now()
        self._datetime_wrapper = datetime_wrapper

    def get_elapsed_time(self) -> datetime.timedelta:
        return self._datetime_wrapper.now() - self._start_time


RequestTimer = Annotated[RequestTimerRaw, Depends()]


class HealthcheckDatabaseConnectionRaw:

    def __init__(self, database_connection: DatabaseConnection) -> None:
        self._database_connection = database_connection

    @property
    def is_healthy(self) -> bool:
        try:
            with self._database_connection.session() as session:
                return session.scalar(text("SELECT 1")) == 1
        except SQLAlchemyError:
            return False

HealthcheckDatabaseConnection = Annotated[HealthcheckDatabaseConnectionRaw, Depends()]
