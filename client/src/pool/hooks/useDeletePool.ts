import { usePoolStore } from "../../common/stores/poolStore.ts"
import { useCallback } from "react"
import { apiDelete } from "../../api/methods.ts"
import { useAlertStore } from "../../alertSystem/alertStore.ts"
import { AlertType } from "../../alertSystem/Alert.ts"
import { useToken } from "../../api/tokenHolder.ts"

export const useDeletePool = () => {
    const { pool } = usePoolStore()
    const token = useToken()
    const { addAlert } = useAlertStore()
    const deletePool = apiDelete("/pool")
    return useCallback(async () => {
        if (token === undefined) {
            throw new Error("Token null on pool deletion!")
        }
        await deletePool()
        addAlert({ type: AlertType.Success, message: "Deleted your pool" })
        return null
    }, [pool, token])
}
