import { usePoolStore } from "../stores/poolStore.ts"
import { useApiGet } from "../../api/methods.ts"
import { Pool } from "../models/Pool.ts"

export const useGetPool = () => {
    const { setPool } = usePoolStore()
    const getPoolApiCall = useApiGet<Pool>("/pool", true)

    return () => {
        getPoolApiCall({})
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
