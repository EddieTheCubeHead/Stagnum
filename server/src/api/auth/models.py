from pydantic import BaseModel


class LoginRedirect(BaseModel):
    redirect_uri: str


class LoginSuccess(BaseModel):
    access_token: str
