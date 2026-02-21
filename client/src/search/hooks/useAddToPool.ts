import { usePoolStore } from "../../common/stores/poolStore.ts"
import { useCallback } from "react"
import { useApiPost } from "../../api/methods.ts"
import { Pool } from "../../common/models/Pool.ts"
import { useAlertStore } from "../../alertSystem/alertStore.ts"
import { AlertType } from "../../alertSystem/Alert.ts"
import { PlayableSpotifyResource } from "../models/PlayableSpotifyResource.ts"
import { useTokenQuery } from "../../common/hooks/useTokenQuery.ts"

export const useAddToPool = (resource: PlayableSpotifyResource) => {
    const poolStore = usePoolStore()
    const { token } = useTokenQuery()
    const { addAlert } = useAlertStore()
    const postAddToPool = useApiPost<Pool>("/pool/content")
    return useCallback(() => {
        if (token === null) {
            throw new Error("Token null on pool addition!")
        }
        postAddToPool({ spotify_uri: resource.uri }).then((poolData) => {
            poolStore.setPool(poolData)
            addAlert({ type: AlertType.Success, message: `Added "${resource.name}" to pool` })
        })
    }, [resource, poolStore, token])
}
