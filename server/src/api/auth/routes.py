import os
import string
import random
import datetime

from fastapi import APIRouter, HTTPException
from fastapi_utils.tasks import repeat_every

from api.auth.dependencies import AuthDatabaseConnection
from api.auth.models import LoginRedirect, LoginSuccess
from api.common import SpotifyClient

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
    return LoginRedirect(redirect_uri=f"{base_url}scopes={scopes_string}&state={state}"
                                      f"&redirect_uri={client_redirect_uri}&client_id={client_id}")


@router.get("/login/callback")
async def login_callback(state: str, code: str, redirect_uri: str, auth_database_connection: AuthDatabaseConnection,
                         spotify_client: SpotifyClient) -> LoginSuccess:
    if not auth_database_connection.is_valid_state(state):
        raise HTTPException(status_code=403, detail="Login state is invalid or expired")
    client_id = os.getenv("SPOTIFY_CLIENT_ID", default=None)
    client_secret = os.getenv("SPOTIFY_CLIENT_SECRET", default=None)
    spotify_result = spotify_client.get_token(code, client_id, client_secret, redirect_uri)
    return LoginSuccess(access_token=f"{spotify_result.token_type} {spotify_result.access_token}")


def cleanup_state_strings(auth_database_connection: AuthDatabaseConnection):
    auth_database_connection.delete_expired_states(datetime.datetime.now(datetime.timezone.utc) - datetime.timedelta(minutes=15))


@router.on_event("startup")
@repeat_every(seconds=120)
def cleanup_state_strings_scheduled(auth_database_connection: AuthDatabaseConnection):
    cleanup_state_strings(auth_database_connection)
