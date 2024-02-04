import base64
import functools
import json
from typing import Annotated

import requests
from fastapi import Depends, HTTPException, Header
from requests import Response

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


def _validate_data(raw_data: Response) -> dict:
    parsed_data = json.loads(raw_data.content.decode("utf8"))
    if raw_data.status_code != 200:
        raise HTTPException(status_code=raw_data.status_code, detail=parsed_data["error"])
    return parsed_data


class SpotifyClientRaw:
    def __init__(self, request_client: RequestsClient):
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
        parsed_data = _validate_data(data)
        return SpotifyTokenResponse(access_token=parsed_data["access_token"], token_type=parsed_data["token_type"],
                                    expires_in=parsed_data["expires_in"], refresh_token=parsed_data["refresh_token"])

    def get_me(self, token: str):
        headers = {
            "Authorization": token
        }
        data = self._request_client.get("https://api.spotify.com/v1/me", headers=headers)
        parsed_data = json.loads(data.content.decode("utf8"))
        user_avatar_url = parsed_data["images"][0]["url"] if len(parsed_data["images"]) > 0 else None
        return User(spotify_id=parsed_data["id"], spotify_username=parsed_data["display_name"],
                    spotify_avatar_url=user_avatar_url)


SpotifyClient = Annotated[SpotifyClientRaw, Depends()]


DatabaseConnection = Annotated[ConnectionManager, Depends()]


class TokenHolderRaw:

    def __init__(self):
        self._tokens: dict[str, User] = {}

    def add_token(self, token: str, user: User):
        self._tokens[token] = user

    def validate_token(self, token: str):
        if token not in self._tokens:
            raise HTTPException(status_code=403, detail="Invalid bearer token!")

    def get_user(self, token: str) -> User:
        return self._tokens[token]


TokenHolder = Annotated[TokenHolderRaw, Depends()]


def validate_token_raw(token: Annotated[str, Header()], token_holder: TokenHolder):
    token_holder.validate_token(token)


validate_token = Depends(validate_token_raw)
