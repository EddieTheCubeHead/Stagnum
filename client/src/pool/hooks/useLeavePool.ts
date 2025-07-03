import { usePoolStore } from "../../common/stores/poolStore.ts"
import { useAlertStore } from "../../alertSystem/alertStore.ts"
import { useApiPost } from "../../api/methods.ts"
import { useCallback } from "react"
import { AlertType } from "../../alertSystem/Alert.ts"
import { useTokenQuery } from "../../common/hooks/useTokenQuery.ts"

export const useLeavePool = () => {
    const { pool, clearPool } = usePoolStore()
    const { token } = useTokenQuery()
    const { addAlert } = useAlertStore()
    const leavePool = useApiPost("/pool/leave")
    return useCallback(() => {
        if (token === undefined) {
            throw new Error("Token null on pool deletion!")
        }
        leavePool({}).then(() => {
            const leftPoolUserName = pool?.owner.display_name
            clearPool()
            addAlert({ type: AlertType.Success, message: `Left ${leftPoolUserName}'s pool` })
        })
    }, [pool, token])
}
