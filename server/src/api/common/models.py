from pydantic import BaseModel


class NamedResource(BaseModel):
    name: str
    link: str


class UserModel(BaseModel):
    display_name: str
    icon_url: str | None
    spotify_id: str


class ParsedTokenResponse(BaseModel):
    token: str
    refresh_token: str
    expires_in: int
