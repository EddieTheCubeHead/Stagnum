from api.health.models import HealthcheckResult, HEALTHY


def should_return_time_taken_and_healthy_status_on_normal_operation(test_client, validate_response):
    response = test_client.get("/health")

    result = validate_response(response)
    result_model = HealthcheckResult.model_validate(result)
    assert result_model.status == HEALTHY


def should_return_database_status_on_normal_operation(test_client, validate_response):
    response = test_client.get("/health")

    result = HealthcheckResult.model_validate(validate_response(response))
    database_resource_result = result.resources[0]
    assert database_resource_result.status == HEALTHY
