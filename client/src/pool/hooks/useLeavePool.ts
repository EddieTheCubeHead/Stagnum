import { usePoolStore } from "../../common/stores/poolStore.ts"
import { useTokenStore } from "../../common/stores/tokenStore.ts"
import { useAlertStore } from "../../alertSystem/alertStore.ts"
import { useApiPost } from "../../api/methods.ts"
import { useCallback } from "react"
import { AlertType } from "../../alertSystem/Alert.ts"

export const useLeavePool = () => {
    const { pool, clearPool } = usePoolStore()
    const { token } = useTokenStore()
    const { addAlert } = useAlertStore()
    const leavePool = useApiPost("/pool/leave")
    return useCallback(() => {
        if (token === null) {
            throw new Error("Token null on pool deletion!")
        }
        leavePool({}).then(() => {
            const leftPoolUserName = pool?.owner.display_name
            clearPool()
            addAlert({ type: AlertType.Success, message: `Left ${leftPoolUserName}'s pool` })
        })
    }, [pool, token])
}
