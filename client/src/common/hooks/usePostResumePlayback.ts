import { usePoolStore } from "../stores/poolStore.ts"
import { useApiPost } from "../../api/methods.ts"
import { Pool } from "../models/Pool.ts"

export const usePostResumePlayback = () => {
    const { setPool } = usePoolStore()
    const resumePlaybackApiCall = useApiPost<Pool>("/pool/playback/resume")

    return () => {
        resumePlaybackApiCall({}).then((poolModel) => {
            setPool(poolModel)
            return poolModel
        })
        return null
    }
}
