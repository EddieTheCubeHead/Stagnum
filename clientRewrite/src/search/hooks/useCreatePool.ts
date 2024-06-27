import { usePoolStore } from "../../common/stores/poolStore.ts"
import { useCallback } from "react"
import { useTokenStore } from "../../common/stores/tokenStore.ts"
import { useApiPost } from "../../api/methods.ts"

export const useCreatePool = (resourceUri: string) => {
    const poolStore = usePoolStore()
    const token = useTokenStore().token
    const postCreatePool = useApiPost("/pool")
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
        })
    }, [resourceUri, poolStore, token])
}
