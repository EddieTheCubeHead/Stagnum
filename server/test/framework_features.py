import json
from datetime import datetime, timedelta

from sqlalchemy import select

from database.database_connection import ConnectionManager
from database.entities import LoginState, User


def should_have_functioning_database_connection(db_connection: ConnectionManager):
    with db_connection.session() as session:
        my_object = User(spotify_email="tester.email@example.test", spotify_username="Test User",
                         spotify_avatar_url="https://picture.spotify.com")
        session.add(my_object)

    with db_connection.session() as session:
        actual_object = session.scalar(select(User).where(User.spotify_email == "tester.email@example.test"))

    assert actual_object.spotify_username == "Test User"


def should_have_automatic_insert_timestamp(db_connection: ConnectionManager):
    with db_connection.session() as session:
        my_object = LoginState(state_string="12345678abcdefgh")
        session.add(my_object)

    with db_connection.session() as session:
        actual_object = session.scalar(select(LoginState).where(LoginState.state_string == "12345678abcdefgh"))

    assert actual_object.insert_time_stamp - datetime.now() < timedelta(milliseconds=10)


def should_return_hello_world_from_server_root(test_server):
    response = test_server.get("/")
    response_message = json.loads(response.content.decode("utf-8"))
    assert response_message.pop("message") == "Hello World!"
