import string
import random

from fastapi import APIRouter

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
async def login(auth_database_connection: AuthDatabaseConnection) -> LoginRedirect:
    base_url = "https://accounts.spotify.com/authorize?"
    scopes_string = " ".join(_required_scopes)
    state = _create_random_string(16)
    auth_database_connection.save_state(state)
    return LoginRedirect(redirect_uri=f"{base_url}scopes={scopes_string}&state={state}")


@router.get("/login/callback")
async def login_callback() -> LoginSuccess:
    pass
