import { usePoolStore } from "../../common/stores/poolStore.ts"
import { useTokenStore } from "../../common/stores/tokenStore.ts"
import { useCallback } from "react"
import { deletePoolContent } from "../../api/deletePoolContent.ts"

export const useDeletePoolContent = (resourceUri: string) => {
    const poolStore = usePoolStore()
    const token = useTokenStore().token
    return useCallback(() => {
        if (token === null) {
            throw new Error("Token null on pool addition!")
        }
        deletePoolContent(resourceUri, token).then((poolData) => {
            poolStore.setPool(poolData)
        })
    }, [resourceUri, poolStore, token])
}
