from logging import getLogger

from fastapi import APIRouter

from api.auth.dependencies import AuthService
from api.auth.models import LoginRedirect, LoginSuccess

_logger = getLogger("main.api.auth.routes")


router = APIRouter(
    prefix="/auth",
    tags=["auth"]
)


@router.get("/login")
async def login(client_redirect_uri: str, auth_service: AuthService) -> LoginRedirect:
    _logger.debug(f"GET /login called with redirect_uri: {client_redirect_uri}")
    return auth_service.build_redirect(client_redirect_uri)


@router.get("/login/callback")
async def login_callback(state: str, code: str, client_redirect_uri: str,
                         auth_service: AuthService) -> LoginSuccess:
    _logger.debug(f"GET /login called with state {state}, code {code} and redirect_uri: {client_redirect_uri}")
    return auth_service.get_token(state, code, client_redirect_uri)
