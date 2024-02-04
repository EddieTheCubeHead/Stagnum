from pydantic import BaseModel


class LoginRedirect(BaseModel):
    redirect_url: str


class LoginSuccess(BaseModel):
    access_token: str
