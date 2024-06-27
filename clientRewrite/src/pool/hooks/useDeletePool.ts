import { useTokenStore } from "../../common/stores/tokenStore.ts"
import { usePoolStore } from "../../common/stores/poolStore.ts"
import { useCallback } from "react"
import { useApiDelete } from "../../api/methods.ts"

export const useDeletePool = () => {
    const poolStore = usePoolStore()
    const token = useTokenStore().token
    const deletePool = useApiDelete("/pool")
    return useCallback(() => {
        if (token === null) {
            throw new Error("Token null on pool deletion!")
        }
        deletePool().then(() => {
            poolStore.clearPool()
        })
    }, [poolStore, token])
}
