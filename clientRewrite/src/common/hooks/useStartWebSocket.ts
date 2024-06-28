import { useTokenStore } from "../stores/tokenStore.ts"
import { usePoolStore } from "../stores/poolStore.ts"

export const useStartWebSocket = () => {
    const { token } = useTokenStore()
    const { setPool, clearPool } = usePoolStore()
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
        }

        return socket
    }
}
