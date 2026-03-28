import { PoolMember } from "../models/PoolMember.ts"
import { useAlertStore } from "../../alertSystem/alertStore.ts"
import { useApiPost } from "../../api/methods.ts"
import { Pool } from "../models/Pool.ts"
import { AlertType } from "../../alertSystem/Alert.ts"

export const usePostDemoteTrack = (track: PoolMember) => {
    const { addAlert } = useAlertStore()
    const demote = useApiPost<Pool>("/pool/demote")

    return async () => {
        const pool = await demote({})
        addAlert({ type: AlertType.Success, message: `Track '${track.name}' demoted successfully` })
        return pool
    }
}
