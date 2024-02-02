import json
from datetime import datetime, timezone, timedelta

from sqlalchemy import String, select, DateTime
from sqlalchemy.orm import DeclarativeBase, declared_attr, Mapped, mapped_column

from database.database_connection import ConnectionManager
from database.entities import EntityBase, LoginState


class _TestDbObjectBase(DeclarativeBase):

    @declared_attr
    def __tablename__(self):
        return self.__name__


class _TestDbObject(_TestDbObjectBase):
    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(64))
    insert_ts: Mapped[datetime] = mapped_column(DateTime(), insert_default=datetime.now())


def should_have_functioning_database_connection(db_connection: ConnectionManager):
    db_connection.init_objects(_TestDbObjectBase)

    with db_connection.session() as session:
        my_object = _TestDbObject(id=1, name="Tester")
        session.add(my_object)

    with db_connection.session() as session:
        actual_object = session.scalar(select(_TestDbObject).where(_TestDbObject.id == 1))

    assert actual_object.name == "Tester"


def should_have_automatic_insert_timestamp(db_connection: ConnectionManager):
    db_connection.init_objects(EntityBase)

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
