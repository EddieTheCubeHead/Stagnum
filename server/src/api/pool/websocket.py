from fastapi import APIRouter
from starlette.websockets import WebSocket, WebSocketDisconnect

from api.common.dependencies import validated_user_from_query_parameters
from api.pool.dependencies import WebsocketUpdater

websocket_router = APIRouter(
    prefix="/websocket",
    tags=["websocket"]
)


@websocket_router.websocket("/connect")
async def register(websocket: WebSocket, user: validated_user_from_query_parameters,
                   websocket_updater: WebsocketUpdater):
    await websocket.accept()
    websocket_updater.add_socket(websocket, user)
    try:
        while True:
            await websocket.receive_json()
    except WebSocketDisconnect:
        websocket_updater.remove_socket(user)