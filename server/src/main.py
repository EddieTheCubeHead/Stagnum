import os

import uvicorn

def _inject_secret(secret_name:str):
    env_name = secret_name.upper()
    with open(f"/run/secrets/{secret_name}") as secret_file:
        secret = secret_file.read()
        print(f"Setting envvar {env_name} from file {secret_name} as {secret}")
        os.environ[env_name] = secret

def _inject_secrets():
    secret_files = ["spotify_client_id", "spotify_client_secret"]
    
    for secret_file in secret_files:
        _inject_secret(secret_file)

if __name__ == "__main__":
    _inject_secrets()
    uvicorn.run("api.application:create_app",
                host=os.getenv("HOST", default="127.0.0.1"),
                port=int(os.getenv("PORT", default="8000")),
                reload=bool(os.getenv("RELOAD", "True")),
                factory=True)
