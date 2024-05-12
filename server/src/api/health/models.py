import datetime
from typing import Literal

from pydantic import BaseModel

HEALTHY = "HEALTHY"
UNHEALTHY = "UNHEALTHY"


class HealthcheckBaseModel(BaseModel):
    status: Literal["HEALTHY", "UNHEALTHY"]
    time_elapsed: datetime.timedelta


class HealthcheckResourceResult(HealthcheckBaseModel):
    resource: str



class HealthcheckResult(HealthcheckBaseModel):
    resources: list[HealthcheckResourceResult]
