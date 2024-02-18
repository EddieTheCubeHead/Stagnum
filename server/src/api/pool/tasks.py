from logging import getLogger

from api.pool.dependencies import PoolDatabaseConnection
from database.database_connection import ConnectionManager

_logger = getLogger("main.api.pool.tasks")


_pool_db_connection = PoolDatabaseConnection(ConnectionManager())
