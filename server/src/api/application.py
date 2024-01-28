from fastapi import FastAPI
from starlette.middleware.cors import CORSMiddleware

from api import pool, search, auth

application = FastAPI()
application.include_router(auth.router)
application.include_router(search.router)
application.include_router(pool.router)


application.add_middleware(CORSMiddleware, allow_origins=["*"], allow_credentials=True, allow_methods=["*"],
                           allow_headers=["*"])


@application.get("/")
async def root():
    return {"message": "Hello World!"}
