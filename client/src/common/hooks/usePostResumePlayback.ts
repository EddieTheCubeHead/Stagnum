import { usePoolStore } from "../stores/poolStore.ts"
import { apiPost } from "../../api/methods.ts"
import { Pool } from "../models/Pool.ts"

export const usePostResumePlayback = () => {
    const { setPool } = usePoolStore()
    const resumePlaybackApiCall = apiPost<Pool>("/pool/playback/resume")

    return async () => {
        const poolModel = await resumePlaybackApiCall({})
        setPool(poolModel)
        return poolModel
    }
}
