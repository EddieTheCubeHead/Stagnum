from pydantic import BaseModel


class NamedResource(BaseModel):
    name: str
    link: str


class UserModel(BaseModel):
    display_name: str
    icon_url: str | None
    spotify_id: str


class PoolJoinedUser(UserModel):
    promoted_track_id: int | None = None


class ParsedTokenResponse(BaseModel):
    token: str
    refresh_token: str
    expires_in: int


class SpotifyTokenResponse(BaseModel):
    access_token: str
    token_type: str
    expires_in: int
    refresh_token: str
