import { useTokenStore } from "../../common/stores/tokenStore.ts"
import { usePoolStore } from "../../common/stores/poolStore.ts"
import { useCallback } from "react"
import { useApiDelete } from "../../api/methods.ts"
import { useAlertStore } from "../../alertSystem/alertStore.ts"
import { AlertType } from "../../alertSystem/Alert.ts"

export const useDeletePool = () => {
    const { pool, clearPool } = usePoolStore()
    const { token } = useTokenStore()
    const { addAlert } = useAlertStore()
    const deletePool = useApiDelete("/pool")
    return useCallback(() => {
        if (token === null) {
            throw new Error("Token null on pool deletion!")
        }
        deletePool().then(() => {
            clearPool()
            addAlert({ type: AlertType.Success, message: "Deleted your pool" })
        })
    }, [pool, token])
}
