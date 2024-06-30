from contextlib import asynccontextmanager
from logging import getLogger
from typing import AsyncGenerator

from apscheduler.jobstores.memory import MemoryJobStore
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from fastapi import FastAPI
from starlette.middleware.cors import CORSMiddleware

from api import auth, health, pool, search
from api.common.dependencies import validated_user
from api.common.helpers import _get_allowed_origins, map_user_entity_to_model
from api.common.models import UserModel

_logger = getLogger("main.application")


_ALLOWED_METHODS = ["GET", "POST", "DELETE", "OPTIONS"]
_ALLOWED_HEADERS = ["Authorization", "Content-Type", "Access-Control-Allow-Origin"]


@asynccontextmanager
async def setup_scheduler(_: FastAPI) -> AsyncGenerator:  # pragma: no cover
    _logger.info("Setting up scheduled jobs")
    job_stores = {"default": MemoryJobStore()}
    _logger.debug("Creating and starting scheduler")
    scheduler = AsyncIOScheduler(jobstores=job_stores)
    scheduler.start()
    _logger.debug("Adding cleanup state strings job")
    scheduler.add_job(auth.cleanup_state_strings, "interval", minutes=1)
    _logger.debug("Adding queue next songs job")
    scheduler.add_job(pool.queue_next_songs, "interval", seconds=1)
    yield


def create_app() -> FastAPI:
    _logger.debug("Creating FastAPI application")
    application = FastAPI(lifespan=setup_scheduler)

    _logger.debug("Adding routers")
    for api_module in (auth, search, pool, health):
        application.include_router(api_module.router)
    application.include_router(pool.websocket_router)

    application.add_middleware(
        CORSMiddleware,
        allow_origins=_get_allowed_origins(),
        allow_credentials=True,
        allow_methods=_ALLOWED_METHODS,
        allow_headers=_ALLOWED_HEADERS,
    )

    @application.get("/me")
    async def get_me(user: validated_user) -> UserModel:
        return map_user_entity_to_model(user)

    return application
