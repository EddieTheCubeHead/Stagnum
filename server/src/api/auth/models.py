from pydantic import BaseModel


class LoginRedirect(BaseModel):
    redirect_url: str


class LoginSuccess(BaseModel):
    access_token: str


class SpotifyTokenResponse(BaseModel):
    access_token: str
    token_type: str
    expires_in: int
    refresh_token: str
