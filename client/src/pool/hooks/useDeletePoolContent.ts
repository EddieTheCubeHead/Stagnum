import { usePoolStore } from "../../common/stores/poolStore.ts"
import { useCallback } from "react"
import { useApiDelete } from "../../api/methods.ts"
import { Pool } from "../../common/models/Pool.ts"
import { useAlertStore } from "../../alertSystem/alertStore.ts"
import { AlertType } from "../../alertSystem/Alert.ts"
import { PoolMember } from "../../common/models/PoolMember.ts"
import { useTokenQuery } from "../../common/hooks/useTokenQuery.ts"

export const useDeletePoolContent = (resource: PoolMember) => {
    const poolStore = usePoolStore()
    const { token } = useTokenQuery()
    const { addAlert } = useAlertStore()
    const deletePoolContent = useApiDelete<Pool>(`/pool/content/${resource.id}`)
    return useCallback(() => {
        if (token === undefined) {
            throw new Error("Token null on pool addition!")
        }
        deletePoolContent().then((poolData) => {
            poolStore.setPool(poolData)
            addAlert({ type: AlertType.Success, message: `Deleted "${resource.name}" from pool` })
        })
    }, [resource, poolStore, token])
}
