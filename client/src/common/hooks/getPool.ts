import { usePoolStore } from "../stores/poolStore.ts"
import { apiGet } from "../../api/methods.ts"
import { Pool } from "../models/Pool.ts"

export const getPool = () => {
    const setPool = usePoolStore().setPool
    const getPoolApiCall = apiGet<Pool>("/pool", true)

    return () => {
        getPoolApiCall()
            .then((poolModel) => {
                if (poolModel) {
                    setPool(poolModel)
                }
                return poolModel
            })
            .catch()
        return null
    }
}
