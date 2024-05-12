from api.health.models import HEALTHY, HealthcheckResult
from conftest import ValidateModel
from starlette.testclient import TestClient


def should_return_time_taken_and_healthy_status_on_normal_operation(
    test_client: TestClient, validate_model: ValidateModel,
) -> None:
    response = test_client.get("/health")

    result = validate_model(HealthcheckResult, response)
    assert result.status == HEALTHY


def should_return_database_status_on_normal_operation(test_client: TestClient, validate_model: ValidateModel) -> None:
    response = test_client.get("/health")

    result = validate_model(HealthcheckResult, response)
    database_resource_result = result.resources[0]
    assert database_resource_result.status == HEALTHY
