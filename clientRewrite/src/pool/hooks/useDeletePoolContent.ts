import { usePoolStore } from "../../common/stores/poolStore.ts"
import { useTokenStore } from "../../common/stores/tokenStore.ts"
import { useCallback } from "react"
import { useApiDelete } from "../../api/methods.ts"
import { Pool } from "../../common/models/Pool.ts"
import { useAlertStore } from "../../alertSystem/alertStore.ts"
import { AlertType } from "../../alertSystem/Alert.ts"
import { PoolMember } from "../../common/models/PoolMember.ts"

export const useDeletePoolContent = (resource: PoolMember) => {
    const poolStore = usePoolStore()
    const token = useTokenStore().token
    const { addAlert } = useAlertStore()
    const deletePoolContent = useApiDelete<Pool>(`/pool/content/${resource.spotify_resource_uri}`)
    return useCallback(() => {
        if (token === null) {
            throw new Error("Token null on pool addition!")
        }
        deletePoolContent().then((poolData) => {
            poolStore.setPool(poolData)
            addAlert({ type: AlertType.Success, message: `Deleted "${resource.name}" from pool` })
        })
    }, [resource, poolStore, token])
}
