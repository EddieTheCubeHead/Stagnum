import datetime

import pytest
from sqlalchemy import select

from api.auth.dependencies import AuthDatabaseConnectionRaw
from api.auth.tasks import cleanup_state_strings
from database.database_connection import ConnectionManager
from database.entities import LoginState
from helpers.classes import MockDateTimeWrapper
from test_types.callables import IncrementNow, BaseAuthLogin, ValidateResponse, \
    GetQueryParameter


@pytest.fixture
def auth_database_connection(db_connection: ConnectionManager,
                             mock_datetime_wrapper: MockDateTimeWrapper) -> AuthDatabaseConnectionRaw:
    return AuthDatabaseConnectionRaw(db_connection, mock_datetime_wrapper)


def should_cleanup_expired_states_from_database_on_cleanup_job(increment_now: IncrementNow,
                                                               auth_database_connection: AuthDatabaseConnectionRaw,
                                                               db_connection: ConnectionManager,
                                                               primary_valid_state_string: str):
    increment_now(datetime.timedelta(minutes=15, seconds=1))
    cleanup_state_strings(auth_database_connection)
    with db_connection.session() as session:
        found_state = session.scalar(select(LoginState).where(LoginState.state_string == primary_valid_state_string))
    assert found_state is None


def should_not_cleanup_non_expired_states_from_database_on_cleanup_job(
        increment_now: IncrementNow, db_connection: ConnectionManager, primary_valid_state_string: str,
        auth_database_connection: AuthDatabaseConnectionRaw):
    increment_now(datetime.timedelta(minutes=14))
    cleanup_state_strings(auth_database_connection)
    with db_connection.session() as session:
        found_state = session.scalar(select(LoginState).where(LoginState.state_string == primary_valid_state_string))
    assert found_state
