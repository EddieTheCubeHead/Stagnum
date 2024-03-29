from contextlib import asynccontextmanager
from logging import getLogger

from apscheduler.jobstores.memory import MemoryJobStore
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from fastapi import FastAPI
from starlette.middleware.cors import CORSMiddleware

from api import pool, search, auth

_logger = getLogger("main.application")


@asynccontextmanager
async def setup_scheduler(_: FastAPI):
    _logger.info("Setting up scheduled jobs")
    job_stores = {
        "default": MemoryJobStore()
    }
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
    application.include_router(auth.router)
    application.include_router(search.router)
    application.include_router(pool.router)

    application.add_middleware(CORSMiddleware, allow_origins=["*"], allow_credentials=True, allow_methods=["*"],
                               allow_headers=["*"])

    @application.get("/")
    async def root():
        return {"message": "Hello World!"}

    return application
