import { useApiPost } from "../../api/methods.ts"
import { useAlertStore } from "../../alertSystem/alertStore.ts"
import { AlertType } from "../../alertSystem/Alert.ts"
import { Pool } from "../models/Pool.ts"
import { PoolMember } from "../models/PoolMember.ts"

export const usePostPromoteTrack = (track: PoolMember) => {
    const { addAlert } = useAlertStore()
    const promoteApiCall = useApiPost<Pool>(`/pool/promote/${track.id}`)

    return () => {
        promoteApiCall({}).then(() => {
            addAlert({ type: AlertType.Success, message: `Track '${track.name}' promoted successfully` })
        })
        return null
    }
}
