import { PoolStore } from "../stores/poolStore.ts"
import { useCallback } from "react"
import { useHandleWebSocketEvent } from "./useHandleWebSocketEvent.ts"
import { useToken } from "../../api/tokenHolder.ts"

type UseStartWebSocketProps = {
    token: ReturnType<typeof useToken>
} & Pick<PoolStore, "setPool" | "setPlaybackState" | "clearPool">

export const useStartWebSocket = ({ token, setPool, setPlaybackState, clearPool }: UseStartWebSocketProps) => {
    const handleWebSocketEvent = useHandleWebSocketEvent()
    return useCallback(() => {
        if (!token) {
            return () => {}
        }
        const socket = new WebSocket(
            `${import.meta.env.VITE_BACKEND_URL.replace("http", "ws")}/websocket/connect?Authorization=${token}`,
        )

        socket.onopen

        socket.onmessage = handleWebSocketEvent

        return socket
    }, [token, setPool, setPlaybackState, clearPool])
}
