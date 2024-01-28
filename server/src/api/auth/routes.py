from fastapi import APIRouter

from api.auth.models import LoginRedirect, LoginSuccess

router = APIRouter(
    prefix="/auth",
    tags=["auth"]
)


@router.get("/login")
async def login() -> LoginRedirect:
    pass


@router.get("/login/callback")
async def login_callback() -> LoginSuccess:
    pass
