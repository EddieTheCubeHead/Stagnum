import { useApiPost } from "../../api/methods.ts"
import { Pool } from "../models/Pool.ts"
import { usePoolStore } from "../stores/poolStore.ts"

export const usePostSharePool = () => {
    const { setPool } = usePoolStore()
    const { pool } = usePoolStore()
    const sharePoolApiCall = useApiPost<Pool>("/pool/share")

    return async () => {
        if (!pool?.share_code) {
            const poolModel = await sharePoolApiCall({})
            setPool(poolModel)
            return poolModel
        }
        return pool
    }
}
