import datetime

from sqlalchemy import select

from api.auth.dependencies import AuthDatabaseConnectionRaw
from api.auth.tasks import cleanup_state_strings
from database.database_connection import ConnectionManager
from database.entities import LoginState
from helpers.classes import MockDateTimeWrapper
from test_types.callables import IncrementNow, BaseAuthLogin, ValidateResponse, \
    GetQueryParameter


def should_cleanup_expired_states_from_database_on_cleanup_job(increment_now: IncrementNow,
                                                               base_auth_login_call: BaseAuthLogin,
                                                               validate_response: ValidateResponse,
                                                               get_query_parameter: GetQueryParameter,
                                                               db_connection: ConnectionManager,
                                                               mock_datetime_wrapper: MockDateTimeWrapper):
    response = base_auth_login_call()
    data_json = validate_response(response)
    state_string = get_query_parameter(data_json["redirect_uri"], "state")
    increment_now(datetime.timedelta(minutes=15, seconds=1))
    cleanup_state_strings(AuthDatabaseConnectionRaw(db_connection, mock_datetime_wrapper))
    with db_connection.session() as session:
        found_state = session.scalar(select(LoginState).where(LoginState.state_string == state_string))
    assert found_state is None


def should_not_cleanup_non_expired_states_from_database_on_cleanup_job(
        increment_now: IncrementNow, base_auth_login_call: BaseAuthLogin,
        validate_response: ValidateResponse, get_query_parameter: GetQueryParameter,
        db_connection: ConnectionManager, mock_datetime_wrapper: MockDateTimeWrapper):
    response = base_auth_login_call()
    data_json = validate_response(response)
    state_string = get_query_parameter(data_json["redirect_uri"], "state")
    increment_now(datetime.timedelta(minutes=14))
    cleanup_state_strings(AuthDatabaseConnectionRaw(db_connection, mock_datetime_wrapper))
    with db_connection.session() as session:
        found_state = session.scalar(select(LoginState).where(LoginState.state_string == state_string))
    assert found_state
