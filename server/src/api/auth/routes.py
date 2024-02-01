from fastapi import APIRouter

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


@router.get("/login")
async def login() -> LoginRedirect:
    base_url = "https://accounts.spotify.com/authorize?"
    return LoginRedirect(redirect_uri=f"{base_url}scopes={' '.join(_required_scopes)}")


@router.get("/login/callback")
async def login_callback() -> LoginSuccess:
    pass
