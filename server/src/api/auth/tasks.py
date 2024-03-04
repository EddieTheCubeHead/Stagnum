from contextlib import asynccontextmanager
import datetime
from logging import getLogger

from apscheduler.jobstores.memory import MemoryJobStore
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from fastapi import FastAPI

from api.auth.dependencies import AuthDatabaseConnection
from database.database_connection import ConnectionManager


_logger = getLogger("main.api.auth.tasks")


_auth_db_connection = AuthDatabaseConnection(ConnectionManager())


def cleanup_state_strings(db_connection: AuthDatabaseConnection = None):
    if db_connection is None:
        db_connection = _auth_db_connection
    _logger.info("Cleaning up expired state strings")
    db_connection.delete_expired_states(
        datetime.datetime.now(datetime.timezone.utc) - datetime.timedelta(minutes=15))
