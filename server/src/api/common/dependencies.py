import base64
import functools
import json
from typing import Annotated

import requests
from fastapi import Depends

from api.common.models import SpotifyTokenResponse
from database.database_connection import ConnectionManager
from database.entities import User


class RequestsClientRaw:

    @functools.wraps(requests.get)
    def get(self, *args, **kwargs):
        return requests.get(*args, **kwargs)

    @functools.wraps(requests.post)
    def post(self, *args, **kwargs):
        return requests.post(*args, **kwargs)


RequestsClient = Annotated[RequestsClientRaw, Depends()]


class SpotifyClientRaw:
    def __init__(self, request_client: RequestsClient) -> SpotifyTokenResponse:
        self._request_client = request_client

    def get_token(self, code: str, client_id: str, client_secret: str, redirect_uri: str):
        form = {
            "code": code,
            "redirect_uri": redirect_uri,
            "grant_type": "authorization_code"
        }
        token = base64.b64encode((client_id + ':' + client_secret).encode('ascii')).decode('ascii')
        headers = {
            "Authorization": "Basic " + token,
            "Content-Type": "application/x-www-form-urlencoded"
        }

        data = self._request_client.post("https://accounts.spotify.com/api/token", headers=headers, data=form)
        parsed_data = json.loads(data.content.decode("utf8"))
        return SpotifyTokenResponse(access_token=parsed_data["access_token"], token_type=parsed_data["token_type"],
                                    scopes=parsed_data["scopes"].split(" "), expires_in=parsed_data["expires_in"],
                                    refresh_token=parsed_data["refresh_token"])

    def get_me(self, token: str):
        headers = {
            "Authorization": token
        }
        data = self._request_client.get("https://api.spotify.com/v1/me", headers=headers)
        parsed_data = json.loads(data.content.decode("utf8"))
        user_avatar_url = parsed_data["images"][0]["url"] if len(parsed_data["images"]) > 0 else None
        return User(spotify_email=parsed_data["email"], spotify_username=parsed_data["display_name"],
                    spotify_avatar_url=user_avatar_url)


SpotifyClient = Annotated[SpotifyClientRaw, Depends()]


DatabaseConnection = Annotated[ConnectionManager, Depends()]
