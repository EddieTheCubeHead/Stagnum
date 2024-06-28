import { usePoolStore } from "../../common/stores/poolStore.ts"
import { useCallback } from "react"
import { useTokenStore } from "../../common/stores/tokenStore.ts"
import { useApiPost } from "../../api/methods.ts"
import { Pool } from "../../common/models/Pool.ts"
import { useAlertStore } from "../../alertSystem/alertStore.ts"
import { AlertType } from "../../alertSystem/Alert.ts"

export const useCreatePool = (resourceUri: string) => {
    const poolStore = usePoolStore()
    const token = useTokenStore().token
    const { addAlert } = useAlertStore()
    const postCreatePool = useApiPost<Pool>("/pool")
    const postBody = {
        spotify_uris: [
            {
                spotify_uri: resourceUri,
            },
        ],
    }
    return useCallback(() => {
        if (token === null) {
            throw new Error("Token null on pool creation!")
        }
        postCreatePool(postBody).then((poolData) => {
            poolStore.setPool(poolData)
            addAlert({ type: AlertType.Success, message: "Pool created!" })
        })
    }, [resourceUri, poolStore, token])
}
