import { usePoolStore } from "../../common/stores/poolStore.ts"
import { useCallback } from "react"
import { postCreatePool } from "../../api/postCreatePool.ts"
import { useTokenStore } from "../../common/stores/tokenStore.ts"

export const useCreatePool = (resourceUri: string) => {
    const poolStore = usePoolStore()
    const token = useTokenStore().token
    return useCallback(() => {
        if (token === null) {
            throw new Error("Token null on pool creation!")
        }
        postCreatePool(resourceUri, token).then((poolData) => {
            poolStore.setPool(poolData)
        })
    }, [resourceUri, poolStore, token])
}
