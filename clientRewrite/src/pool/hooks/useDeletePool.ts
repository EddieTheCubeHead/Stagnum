import { useTokenStore } from "../../common/stores/tokenStore.ts"
import { usePoolStore } from "../../common/stores/poolStore.ts"
import { useCallback } from "react"
import { deletePool } from "../../api/deletePool.ts"

export const useDeletePool = () => {
    const poolStore = usePoolStore()
    const token = useTokenStore().token
    return useCallback(() => {
        if (token === null) {
            throw new Error("Token null on pool deletion!")
        }
        deletePool(token).then(() => {
            poolStore.clearPool()
        })
    }, [poolStore, token])
}
