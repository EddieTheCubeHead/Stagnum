from fastapi import APIRouter

from api.pool.models import PoolCreationData, Pool

router = APIRouter(
    prefix="/pool",
    tags=["pool"]
)


@router.post("/")
async def pool(base_collection: PoolCreationData) -> Pool:
    pass
