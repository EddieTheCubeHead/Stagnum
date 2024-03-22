def should_return_pool_code_from_share_route(existing_playback, test_client, validate_response, valid_token_header):
    response = test_client.post("/pool/share", headers=valid_token_header)

    result = validate_response(response)
    assert result["share_code"] is not None
    assert type(result["share_code"]) == str


def should_have_only_uppercase_letters_and_digits_in_share_code(existing_playback, test_client, validate_response,
                                                                valid_token_header):
    response = test_client.post("/pool/share", headers=valid_token_header)

    result = validate_response(response)
    for char in result["share_code"]:
        assert char.isupper() or char.isdigit()


def should_have_eight_characters_in_share_code(existing_playback, test_client, validate_response, valid_token_header):
    response = test_client.post("/pool/share", headers=valid_token_header)

    result = validate_response(response)
    assert len(result["share_code"]) == 8
