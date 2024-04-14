import os
from contextlib import contextmanager
from logging import getLogger
from typing import ContextManager

from sqlalchemy import create_engine
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import sessionmaker, Session

from database.entities import EntityBase

_logger = getLogger("main.database_connection")


class ConnectionManager:

    # De-referencing sqlite in-memory engine even briefly drops all data, which is bad.
    # We implement here an approach that forces the engine into global state but only if it's an in-memory engine
    # thus preventing us from dropping data. Not perfect but good enough. We're mostly using Postgre anyway.
    _sqlite_in_memory_engine = None

    def __init__(self):
        db_address = os.getenv("DATABASE_CONNECTION_URL", default="sqlite:///:memory:")
        echo = os.getenv("VERBOSE_SQLALCHEMY", default="False").lower() != "false"
        _logger.debug(f"Initializing database connection manager from connection string '{db_address}'")
        if db_address == "sqlite:///:memory:":
            _logger.debug("Using sqlite in-memory database")
            self.engine = self._use_persistent_in_memory_engine(db_address, echo)
        else:
            self.engine = create_engine(db_address, echo=echo)
        self._session = sessionmaker()
        self._session.configure(bind=self.engine)
        self.init_objects(EntityBase)

    def init_objects(self, base_model):
        _logger.debug("Initializing database from model metadata")
        base_model.metadata.create_all(self.engine)

    @classmethod
    def _use_persistent_in_memory_engine(cls, db_address: str, echo: bool):
        if cls._sqlite_in_memory_engine is None:
            cls._sqlite_in_memory_engine = create_engine(db_address, echo=echo)
        return cls._sqlite_in_memory_engine

    @contextmanager
    def session(self) -> ContextManager[Session]:
        context_session = self._session()
        _logger.debug(f"Created a database session with hash {context_session.hash_key}")
        try:
            context_session.expire_on_commit = False
            yield context_session
        except SQLAlchemyError:
            context_session.rollback()
            _logger.debug(f"Rolled back session {context_session.hash_key}")
        else:
            context_session.commit()
            _logger.debug(f"Committed session {context_session.hash_key}")
        finally:
            context_session.close()
            _logger.debug(f"Closed session {context_session.hash_key}")
