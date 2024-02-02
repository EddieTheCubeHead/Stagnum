import functools
from typing import Annotated

import requests
from fastapi import Depends

from database.database_connection import ConnectionManager


class RequestsClientRaw:

    @functools.wraps(requests.get)
    def get(self, *args, **kwargs):
        return requests.get(*args, **kwargs)

    @functools.wraps(requests.post)
    def post(self, *args, **kwargs):
        return requests.post(*args, **kwargs)


class SpotifyClientRaw:
    def __init__(self, request_client: RequestsClientRaw):
        self._request_client = request_client


RequestClient = Annotated[RequestsClientRaw, Depends()]


SpotifyClient = Annotated[SpotifyClientRaw, Depends()]


DatabaseConnection = Annotated[ConnectionManager, Depends()]
