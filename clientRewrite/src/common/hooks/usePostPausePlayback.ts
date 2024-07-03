import { usePoolStore } from "../stores/poolStore.ts"
import { useApiPost } from "../../api/methods.ts"
import { Pool } from "../models/Pool.ts"

export const usePostPausePlayback = () => {
    const { setPool } = usePoolStore()
    const pausePlaybackApiCall = useApiPost<Pool>("/pool/playback/pause")

    return () => {
        pausePlaybackApiCall({}).then((poolModel) => {
            setPool(poolModel)
            return poolModel
        })
        return null
    }
}
