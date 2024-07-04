import { useApiPost } from "../../api/methods.ts"
import { useAlertStore } from "../../alertSystem/alertStore.ts"
import { AlertType } from "../../alertSystem/Alert.ts"
import { Pool } from "../models/Pool.ts"

export const usePostPromoteTrack = (track_id: number) => {
    const { addAlert } = useAlertStore()
    const promoteApiCall = useApiPost<Pool>(`/pool/promote/${track_id}`)

    return () => {
        promoteApiCall({}).then(() => {
            addAlert({ type: AlertType.Success, message: "Track promoted successfully" })
        })
        return null
    }
}
