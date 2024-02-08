import os
import string
import random

from fastapi import APIRouter, HTTPException

from api.auth.dependencies import AuthDatabaseConnection
from api.auth.models import LoginRedirect, LoginSuccess
from api.common.dependencies import TokenHolder, SpotifyClient


router = APIRouter(
    prefix="/auth",
    tags=["auth"]
)

_required_scopes = [
    "user-read-playback-state",
    "user-modify-playback-state",
    "user-read-private",
    "user-read-email"
]


def _create_random_string(length: int) -> str:
    chars = string.ascii_letters + string.digits
    return "".join(random.choice(chars) for _ in range(length))


@router.get("/login")
async def login(client_redirect_uri: str, auth_database_connection: AuthDatabaseConnection) -> LoginRedirect:
    base_url = "https://accounts.spotify.com/authorize?"
    scopes_string = " ".join(_required_scopes)
    state = _create_random_string(16)
    auth_database_connection.save_state(state)
    client_id = os.getenv("SPOTIFY_CLIENT_ID", default=None)
    if client_id is None:
        raise HTTPException(status_code=500)
    return LoginRedirect(redirect_uri=f"{base_url}scopes={scopes_string}&state={state}&response_type=code"
                                      f"&redirect_uri={client_redirect_uri}&client_id={client_id}")


@router.get("/login/callback")
async def login_callback(state: str, code: str, client_redirect_uri: str,
                         auth_database_connection: AuthDatabaseConnection, spotify_client: SpotifyClient,
                         token_holder: TokenHolder) -> LoginSuccess:
    if not auth_database_connection.is_valid_state(state):
        raise HTTPException(status_code=403, detail="Login state is invalid or expired")
    client_id = os.getenv("SPOTIFY_CLIENT_ID", default=None)
    client_secret = os.getenv("SPOTIFY_CLIENT_SECRET", default=None)
    token_result = spotify_client.get_token(code, client_id, client_secret, client_redirect_uri)
    token = f"{token_result.token_type} {token_result.access_token}"
    me_result = spotify_client.get_me(token)
    auth_database_connection.update_logged_in_user(me_result, state)
    token_holder.add_token(token, me_result)
    return LoginSuccess(access_token=token)
