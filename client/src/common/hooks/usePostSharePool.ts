import { useApiPost } from "../../api/methods.ts"
import { Pool } from "../models/Pool.ts"
import { usePoolStore } from "../stores/poolStore.ts"

export const usePostSharePool = () => {
    const { setPool } = usePoolStore()
    const { pool } = usePoolStore()
    const sharePoolApiCall = useApiPost<Pool>("/pool/share")

    return () => {
        if (!pool?.share_code) {
            sharePoolApiCall({}).then((poolModel) => {
                setPool(poolModel)
                return poolModel
            })
        }
        return null
    }
}
