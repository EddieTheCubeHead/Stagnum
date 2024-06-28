import { usePoolStore } from "../../common/stores/poolStore.ts"
import { useTokenStore } from "../../common/stores/tokenStore.ts"
import { useCallback } from "react"
import { useApiDelete } from "../../api/methods.ts"
import { Pool } from "../../common/models/Pool.ts"
import { useAlertStore } from "../../alertSystem/alertStore.ts"
import { AlertType } from "../../alertSystem/Alert.ts"

export const useDeletePoolContent = (resourceUri: string) => {
    const poolStore = usePoolStore()
    const token = useTokenStore().token
    const { addAlert } = useAlertStore()
    const deletePoolContent = useApiDelete<Pool>(`/pool/content/${resourceUri}`)
    return useCallback(() => {
        if (token === null) {
            throw new Error("Token null on pool addition!")
        }
        deletePoolContent().then((poolData) => {
            poolStore.setPool(poolData)
            addAlert({ type: AlertType.Success, message: "Pool member deleted successfully!" })
        })
    }, [resourceUri, poolStore, token])
}
