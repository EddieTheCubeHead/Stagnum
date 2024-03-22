def should_return_pool_code_from_share_route(test_client, validate_response):
    response = test_client.post("/pool/share")

    result = validate_response(response)
    assert type(result["code"]) == str
    assert len(result["code"]) == 8
