import { usePoolStore } from "../stores/poolStore.ts"
import { apiPost } from "../../api/methods.ts"
import { Pool } from "../models/Pool.ts"

export const usePostPausePlayback = () => {
    const { setPool } = usePoolStore()
    const pausePlaybackApiCall = apiPost<Pool>("/pool/playback/pause")

    return async () => {
        const poolModel = await pausePlaybackApiCall({})
        setPool(poolModel)
        return poolModel
    }
}
