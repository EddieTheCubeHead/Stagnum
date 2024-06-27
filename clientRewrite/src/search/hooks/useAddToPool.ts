import { usePoolStore } from "../../common/stores/poolStore.ts"
import { useTokenStore } from "../../common/stores/tokenStore.ts"
import { useCallback } from "react"
import { useApiPost } from "../../api/methods.ts"

export const useAddToPool = (resourceUri: string) => {
    const poolStore = usePoolStore()
    const token = useTokenStore().token
    const postAddToPool = useApiPost("/pool/content")
    return useCallback(() => {
        if (token === null) {
            throw new Error("Token null on pool addition!")
        }
        postAddToPool({ spotify_uri: resourceUri }).then((poolData) => {
            poolStore.setPool(poolData)
        })
    }, [resourceUri, poolStore, token])
}
