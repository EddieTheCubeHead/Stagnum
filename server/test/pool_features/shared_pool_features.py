def should_return_pool_code_from_share_route(existing_playback, test_client, validate_response, valid_token_header):
    response = test_client.post("/pool/share", headers=valid_token_header)

    result = validate_response(response)
    assert type(result["share_code"]) == str
    assert len(result["share_code"]) == 8
