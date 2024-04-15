import json
from datetime import datetime, timedelta

from sqlalchemy import select

from api.common.helpers import map_user_entity_to_model
from api.common.models import UserModel
from database.database_connection import ConnectionManager
from database.entities import LoginState, User


def should_have_functioning_database_connection(db_connection: ConnectionManager):
    with db_connection.session() as session:
        my_object = User(spotify_id="test user", spotify_username="Test User",
                         spotify_avatar_url="https://picture.spotify.com")
        session.add(my_object)

    with db_connection.session() as session:
        actual_object = session.scalar(select(User).where(User.spotify_id == "test user"))

    assert actual_object.spotify_username == "Test User"


def should_have_automatic_insert_timestamp(db_connection: ConnectionManager):
    with db_connection.session() as session:
        my_object = LoginState(state_string="12345678abcdefgh")
        session.add(my_object)

    with db_connection.session() as session:
        actual_object = session.scalar(select(LoginState).where(LoginState.state_string == "12345678abcdefgh"))

    assert actual_object.insert_time_stamp - datetime.now() < timedelta(milliseconds=10)


def should_return_hello_world_from_server_root(test_client):
    response = test_client.get("/")
    response_message = json.loads(response.content.decode("utf-8"))
    assert response_message.pop("message") == "Hello World!"


def should_return_current_user_from_me_route(test_client, valid_token_header, logged_in_user, validate_response):
    response = test_client.get("/me", headers=valid_token_header)

    result = UserModel.model_validate(validate_response(response))
    assert result == map_user_entity_to_model(logged_in_user)
