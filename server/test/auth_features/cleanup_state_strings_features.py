import datetime

from sqlalchemy import select

from api.auth.dependencies import AuthDatabaseConnectionRaw
from api.auth.tasks import cleanup_state_strings
from auth_features.conftest import base_auth_login_callable
from conftest import increment_now_callable, validate_response_callable, get_query_parameter_callable, \
    MockDateTimeWrapper
from database.database_connection import ConnectionManager
from database.entities import LoginState


def should_cleanup_expired_states_from_database_on_cleanup_job(increment_now: increment_now_callable,
                                                               base_auth_login_call: base_auth_login_callable,
                                                               validate_response: validate_response_callable,
                                                               get_query_parameter: get_query_parameter_callable,
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
        increment_now: increment_now_callable, base_auth_login_call: base_auth_login_callable,
        validate_response: validate_response_callable, get_query_parameter: get_query_parameter_callable,
        db_connection: ConnectionManager, mock_datetime_wrapper: MockDateTimeWrapper):
    response = base_auth_login_call()
    data_json = validate_response(response)
    state_string = get_query_parameter(data_json["redirect_uri"], "state")
    increment_now(datetime.timedelta(minutes=14))
    cleanup_state_strings(AuthDatabaseConnectionRaw(db_connection, mock_datetime_wrapper))
    with db_connection.session() as session:
        found_state = session.scalar(select(LoginState).where(LoginState.state_string == state_string))
    assert found_state
