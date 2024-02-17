from contextlib import asynccontextmanager
import datetime
from logging import getLogger

from apscheduler.jobstores.memory import MemoryJobStore
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from fastapi import FastAPI

from api.auth.dependencies import AuthDatabaseConnection
from database.database_connection import ConnectionManager


_logger = getLogger("main.api.auth.scheduler")


scheduler_db_connection = AuthDatabaseConnection(ConnectionManager())


def cleanup_state_strings(db_connection: AuthDatabaseConnection = None):
    if db_connection is None:
        db_connection = scheduler_db_connection
    _logger.info("Cleaning up expired state strings")
    db_connection.delete_expired_states(
        datetime.datetime.now(datetime.timezone.utc) - datetime.timedelta(minutes=15))


@asynccontextmanager
async def setup_scheduler(_: FastAPI):
    _logger.info("Setting up scheduled job to clear up expired state strings")
    job_stores = {
        "default": MemoryJobStore()
    }
    scheduler = AsyncIOScheduler(jobstores=job_stores)
    scheduler.start()
    scheduler.add_job(cleanup_state_strings, "interval", minutes=1)
    yield
