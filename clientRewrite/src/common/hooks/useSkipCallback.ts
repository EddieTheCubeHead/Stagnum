import { useApiPost } from "../../api/methods.ts"
import { usePoolStore } from "../stores/poolStore.ts"
import { PoolTrack } from "../models/PoolTrack.ts"
import { useAlertStore } from "../../alertSystem/alertStore.ts"
import { AlertType } from "../../alertSystem/Alert.ts"

export const useSkipCallback = () => {
    const skipCallback = useApiPost<PoolTrack>("/pool/playback/skip")
    const { addAlert } = useAlertStore()
    const { setPlaybackState, pool } = usePoolStore()
    return async () => {
        const newNowPlaying = await skipCallback({})
        const oldNowPlaying = pool?.currently_playing
        setPlaybackState(newNowPlaying)
        addAlert({ type: AlertType.Success, message: `Skipped "${oldNowPlaying?.name}"` })
    }
}
