import { useCallback } from "react"
import { usePoolStore } from "../stores/poolStore.ts"
import { Pool } from "../models/Pool.ts"
import { PoolTrack } from "../models/PoolTrack.ts"

interface WebSocketPoolUpdate {
    type: "pool"
    model: Pool
}

interface WebSocketPlaybackUpdate {
    type: "current_track"
    model: PoolTrack
}

type WebSocketEventData = WebSocketPoolUpdate | WebSocketPlaybackUpdate

interface WebSocketEvent {
    data: string
}

export const useHandleWebSocketEvent = () => {
    const { clearPool, setPool, setPlaybackState } = usePoolStore()
    return useCallback((event: WebSocketEvent) => {
        const message: WebSocketEventData = JSON.parse(event.data)
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
    }, [])
}
