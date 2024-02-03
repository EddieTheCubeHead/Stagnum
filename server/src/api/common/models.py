from pydantic import BaseModel


class NamedResource(BaseModel):
    name: str
    link: str


class SpotifyTokenResponse(BaseModel):
    access_token: str
    token_type: str
    scopes: list[str]
    expires_in: int
    refresh_token: str
