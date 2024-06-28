import { usePoolStore } from "../../common/stores/poolStore.ts"
import { useTokenStore } from "../../common/stores/tokenStore.ts"
import { useCallback } from "react"
import { useApiDelete } from "../../api/methods.ts"
import { Pool } from "../../common/models/Pool.ts"

export const useDeletePoolContent = (resourceUri: string) => {
    const poolStore = usePoolStore()
    const token = useTokenStore().token
    const deletePoolContent = useApiDelete<Pool>(`/pool/content/${resourceUri}`)
    return useCallback(() => {
        console.log("useDeletePoolContent inner")
        if (token === null) {
            throw new Error("Token null on pool addition!")
        }
        deletePoolContent().then((poolData) => {
            poolStore.setPool(poolData)
        })
    }, [resourceUri, poolStore, token])
}
