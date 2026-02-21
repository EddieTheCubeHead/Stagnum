import { usePoolStore } from "../../common/stores/poolStore.ts"
import { useCallback } from "react"
import { useApiPost } from "../../api/methods.ts"
import { Pool } from "../../common/models/Pool.ts"
import { useAlertStore } from "../../alertSystem/alertStore.ts"
import { AlertType } from "../../alertSystem/Alert.ts"
import { PlayableSpotifyResource } from "../models/PlayableSpotifyResource.ts"
import { useTokenQuery } from "../../common/hooks/useTokenQuery.ts"

export const useCreatePool = (resource: PlayableSpotifyResource) => {
    const poolStore = usePoolStore()
    const { token } = useTokenQuery()
    const { addAlert } = useAlertStore()
    const postCreatePool = useApiPost<Pool>("/pool")
    const postBody = {
        spotify_uris: [
            {
                spotify_uri: resource.uri,
            },
        ],
    }
    return useCallback(() => {
        if (token === null) {
            throw new Error("Token null on pool creation!")
        }
        postCreatePool(postBody).then((poolData) => {
            poolStore.setPool(poolData)
            addAlert({ type: AlertType.Success, message: `Created a pool from "${resource.name}"` })
        })
    }, [resource, poolStore, token])
}
