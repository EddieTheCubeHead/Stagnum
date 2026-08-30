import { usePoolStore } from "../common/stores/poolStore.ts"
import { apiGet } from "./methods.ts"
import { Pool } from "../common/models/Pool.ts"

export const getPool = () => {
    const setPool = usePoolStore.getState().setPool
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
