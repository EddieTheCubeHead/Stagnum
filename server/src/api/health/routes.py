from logging import getLogger

from fastapi import APIRouter

from api.common.dependencies import DateTimeWrapper
from api.health.dependencies import HealthcheckDatabaseConnection, RequestTimer
from api.health.models import HEALTHY, UNHEALTHY, HealthcheckResourceResult, HealthcheckResult

_logger = getLogger("main.api.pool.routes")

router = APIRouter(prefix="/health", tags=["health"])


@router.get("/")
def healthcheck(
    request_timer: RequestTimer,
    healthcheck_database_connection: HealthcheckDatabaseConnection,
    datetime_wrapper: DateTimeWrapper,
) -> HealthcheckResult:
    database_timer_start = datetime_wrapper.now()
    database_status = HEALTHY if healthcheck_database_connection.is_healthy else UNHEALTHY
    database_timer = datetime_wrapper.now() - database_timer_start
    database_result = HealthcheckResourceResult(
        resource="database", status=database_status, time_elapsed=database_timer,
    )
    return HealthcheckResult(
        status=database_result.status, time_elapsed=request_timer.get_elapsed_time(), resources=[database_result],
    )
