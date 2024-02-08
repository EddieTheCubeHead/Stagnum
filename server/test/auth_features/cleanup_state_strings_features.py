import datetime

from sqlalchemy import select

from api.auth.dependencies import AuthDatabaseConnectionRaw
from api.auth.scheduler import cleanup_state_strings
from database.entities import LoginState


def should_cleanup_expired_states_from_database_on_cleanup_job(monkeypatch, base_auth_login_call, validate_response,
                                                               get_query_parameter, db_connection):
    response = base_auth_login_call()
    data_json = validate_response(response)
    state_string = get_query_parameter(data_json["redirect_uri"], "state")
    soon = datetime.datetime.now(datetime.timezone.utc) + datetime.timedelta(minutes=15, seconds=1)

    class MockDateTime:
        @classmethod
        def now(cls, *args):
            return soon

    monkeypatch.setattr(datetime, "datetime", MockDateTime)
    cleanup_state_strings(AuthDatabaseConnectionRaw(db_connection))
    with db_connection.session() as session:
        found_state = session.scalar(select(LoginState).where(LoginState.state_string == state_string))
    assert found_state is None


def should_not_cleanup_non_expired_states_from_database_on_cleanup_job(monkeypatch, base_auth_login_call,
                                                                       validate_response, get_query_parameter,
                                                                       db_connection):
    response = base_auth_login_call()
    data_json = validate_response(response)
    state_string = get_query_parameter(data_json["redirect_uri"], "state")
    soon = datetime.datetime.now(datetime.timezone.utc) + datetime.timedelta(minutes=14)

    class MockDateTime:
        @classmethod
        def now(cls, *args):
            return soon

    monkeypatch.setattr(datetime, "datetime", MockDateTime)
    cleanup_state_strings(AuthDatabaseConnectionRaw(db_connection))
    with db_connection.session() as session:
        found_state = session.scalar(select(LoginState).where(LoginState.state_string == state_string))
    assert found_state
