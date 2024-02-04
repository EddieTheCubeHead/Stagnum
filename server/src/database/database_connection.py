import os
from contextlib import contextmanager
from typing import ContextManager

from sqlalchemy import create_engine
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import sessionmaker, Session

from database.entities import EntityBase


class ConnectionManager:

    # De-referencing sqlite in-memory engine even briefly drops all data. This forces the engine into global state
    # thus preventing us from dropping data. Not perfect but good enough. We're mostly using Postgre anyway.
    _sqlite_in_memory_engine = None

    def __init__(self, db_address: str = None, echo: bool = False):
        if db_address is None:
            db_address = os.getenv("DATABASE_CONNECTION_URL", default="sqlite:///:memory:")
        if db_address == "sqlite:///:memory:":
            self.engine = self._use_persistent_in_memory_engine(db_address, echo)
        else:
            self.engine = create_engine(db_address, echo=echo)
        self._session = sessionmaker()
        self._session.configure(bind=self.engine)
        self.init_objects(EntityBase)

    def init_objects(self, base_model):
        base_model.metadata.create_all(self.engine)

    @classmethod
    def _use_persistent_in_memory_engine(cls, db_address: str, echo: bool):
        if cls._sqlite_in_memory_engine is None:
            cls._sqlite_in_memory_engine = create_engine(db_address, echo=echo)
        return cls._sqlite_in_memory_engine

    @contextmanager
    def session(self) -> ContextManager[Session]:
        context_session = self._session()
        try:
            context_session.expire_on_commit = False
            yield context_session
        except SQLAlchemyError:
            context_session.rollback()
        else:
            context_session.commit()
        finally:
            context_session.close()
