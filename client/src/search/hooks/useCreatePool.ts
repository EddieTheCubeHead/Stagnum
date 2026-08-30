import { usePoolStore } from "../../common/stores/poolStore.ts"
import { useCallback } from "react"
import { apiPost } from "../../api/methods.ts"
import { Pool } from "../../common/models/Pool.ts"
import { useAlertStore } from "../../alertSystem/alertStore.ts"
import { AlertType } from "../../alertSystem/Alert.ts"
import { PlayableSpotifyResource } from "../models/PlayableSpotifyResource.ts"
import { useToken } from "../../api/tokenHolder.ts"

export const useCreatePool = (resource: PlayableSpotifyResource) => {
    const poolStore = usePoolStore()
    const token = useToken()
    const { addAlert } = useAlertStore()
    const postCreatePool = apiPost<Pool>("/pool")
    const postBody = {
        spotify_uris: [
            {
                spotify_uri: resource.uri,
            },
        ],
    }
    return useCallback(async () => {
        if (token === null) {
            throw new Error("Token null on pool creation!")
        }
        const poolData = await postCreatePool(postBody)
        addAlert({ type: AlertType.Success, message: `Created a pool from "${resource.name}"` })
        return poolData
    }, [resource, poolStore, token])
}
