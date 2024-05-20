import datetime

from api.common.helpers import map_user_entity_to_model
from api.common.models import UserModel
from database.database_connection import ConnectionManager
from database.entities import LoginState, User
from helpers.classes import ApproxDatetime, MockDateTimeWrapper
from sqlalchemy import select
from starlette.testclient import TestClient
from test_types.callables import ValidateModel
from test_types.typed_dictionaries import Headers


def should_have_functioning_database_connection(db_connection: ConnectionManager) -> None:
    with db_connection.session() as session:
        my_object = User(
            spotify_id="test user", spotify_username="Test User", spotify_avatar_url="https://picture.spotify.com"
        )
        session.add(my_object)

    with db_connection.session() as session:
        actual_object = session.scalar(select(User).where(User.spotify_id == "test user"))

    assert actual_object.spotify_username == "Test User"


def should_have_automatic_insert_timestamp(
    db_connection: ConnectionManager, mock_datetime_wrapper: MockDateTimeWrapper
) -> None:
    with db_connection.session() as session:
        my_object = LoginState(state_string="12345678abcdefgh")
        session.add(my_object)

    with db_connection.session() as session:
        actual_object = session.scalar(select(LoginState).where(LoginState.state_string == "12345678abcdefgh"))

    actual_timestamp = mock_datetime_wrapper.ensure_utc(actual_object.insert_time_stamp)
    expected_timestamp = ApproxDatetime(mock_datetime_wrapper.now(), datetime.timedelta(seconds=2))
    assert actual_timestamp == expected_timestamp


def should_return_current_user_from_me_route(
    test_client: TestClient, valid_token_header: Headers, logged_in_user: User, validate_model: ValidateModel
) -> None:
    response = test_client.get("/me", headers=valid_token_header)

    result = validate_model(UserModel, response)
    assert result == map_user_entity_to_model(logged_in_user)
