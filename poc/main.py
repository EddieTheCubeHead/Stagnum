import json
import string
import random
import requests
import base64

from fastapi import FastAPI
from starlette.middleware.cors import CORSMiddleware
from starlette.requests import Request
from starlette.responses import RedirectResponse

application = FastAPI()


application.add_middleware(CORSMiddleware, allow_origins=["*"], allow_credentials=True, allow_methods=["*"],
                           allow_headers=["*"])


with open("poc/secrets.json", "r") as secret_file:
    secrets = json.load(secret_file)
    client_id = secrets["client_id"]
    client_secret = secrets["client_secret"]


redirect_url = "http://localhost:8000/auth/callback"
json_token_holder = {
    "token": None
}


@application.get("/")
async def root():
    return {"message": "Hello world"}


@application.get("/auth/login")
async def login(request: Request):
    scope = "streaming user-read-email user-read-private"
    state = create_random_string(16)
    auth_query_parameters = (f"response_type=code&client_id={client_id}&scope={scope}"
                             f"&redirect_uri={redirect_url}&state={state}")
    return RedirectResponse("https://accounts.spotify.com/authorize?" + auth_query_parameters)


@application.get("/auth/callback")
async def auth_callback(request: Request):
    code = request.query_params.get("code")
    form = {
        "code": code,
        "redirect_uri": redirect_url,
        "grant_type": "authorization_code"
    }
    token = base64.b64encode((client_id + ':' + client_secret).encode('ascii')).decode('ascii')
    headers = {
        "Authorization": "Basic " + token,
        "Content-Type": "application/x-www-form-urlencoded"
    }

    data = requests.post("https://accounts.spotify.com/api/token", headers=headers, data=form)
    json_token_holder["token"] = json.loads(data.content.decode("utf-8"))["access_token"]


@application.get("/auth/token")
async def get_token(request: Request):
    return {"token": json_token_holder["token"]}


def create_random_string(length: int) -> str:
    chars = string.ascii_letters + string.digits
    return "".join(random.choice(chars) for _ in range(length))
