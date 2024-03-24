import os
from dataclasses import dataclass

import pytest


@dataclass
class WeightedParameters:
    custom_weight: int
    pseudo_random_floor: int
    pseudo_random_ceiling: int


@pytest.fixture(params=[WeightedParameters(5, 60, 90), WeightedParameters(10, 50, 75)])
def weighted_parameters(request, monkeypatch) -> WeightedParameters:
    parameters: WeightedParameters = request.param
    monkeypatch.setenv("CUSTOM_WEIGHT_SCALE", str(parameters.custom_weight))
    monkeypatch.setenv("PSEUDO_RANDOM_FLOOR", str(parameters.pseudo_random_floor))
    monkeypatch.setenv("PSEUDO_RANDOM_CEILING", str(parameters.pseudo_random_ceiling))
    return parameters


@pytest.mark.wip
@pytest.mark.slow
@pytest.mark.parametrize("existing_playback", [2], indirect=True)
def should_always_alternate_songs_in_two_song_queue(existing_playback, test_client, valid_token_header,
                                                    requests_client, get_query_parameter, weighted_parameters):
    assert len(existing_playback) == 2
    last_call_uri = None
    for _ in range(20):
        test_client.post("/pool/playback/skip", headers=valid_token_header)
        actual_queue_call = requests_client.post.call_args_list[-2]
        track_uri = get_query_parameter(actual_queue_call.args[0], "uri")
        assert last_call_uri != track_uri
        last_call_uri = track_uri
