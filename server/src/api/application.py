from logging import getLogger

from fastapi import FastAPI
from starlette.middleware.cors import CORSMiddleware

from api import pool, search, auth


_logger = getLogger("main.application")


def create_app() -> FastAPI:
    _logger.debug("Creating FastAPI application")
    application = FastAPI(lifespan=auth.setup_scheduler)

    _logger.debug("Adding routers")
    application.include_router(auth.router)
    application.include_router(search.router)
    application.include_router(pool.router)

    application.add_middleware(CORSMiddleware, allow_origins=["*"], allow_credentials=True, allow_methods=["*"],
                               allow_headers=["*"])

    @application.get("/")
    async def root():
        return {"message": "Hello World!"}

    return application
