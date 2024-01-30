from fastapi import APIRouter

from api.pool.models import PoolCreationData, Pool, PoolContent

router = APIRouter(
    prefix="/pool",
    tags=["pool"]
)


@router.post("/")
async def create_pool(base_collection: PoolCreationData) -> Pool:
    pass


@router.get("/")
async def get_pool() -> Pool:
    pass


@router.post("/content")
async def add_content(to_add: PoolContent) -> Pool:
    pass


@router.delete("/content")
async def delete_content(to_delete: PoolContent) -> Pool:
    pass
