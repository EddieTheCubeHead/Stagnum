import { usePoolStore } from "../stores/poolStore.ts"
import { useTokenQuery } from "./useTokenQuery.ts"

export const useStartWebSocket = () => {
    const { token } = useTokenQuery()
    const { setPool, setPlaybackState, clearPool } = usePoolStore()
    if (!token) {
        return () => {}
    }
    return () => {
        const socket = new WebSocket(
            `${import.meta.env.VITE_BACKEND_URL.replace("http", "ws")}/websocket/connect?Authorization=${token}`,
        )

        socket.onopen

        socket.onmessage = (event) => {
            const message = JSON.parse(event.data)
            if (message.type === "pool") {
                // Stupid workaround because backend sends stupid data
                // TODO clear up once old UI is gone and we can change backend data models
                if (message.model.owner === null) {
                    clearPool()
                } else {
                    setPool(message.model)
                }
            }

            if (message.type === "current_track") {
                setPlaybackState(message.model)
            }
        }

        return socket
    }
}
