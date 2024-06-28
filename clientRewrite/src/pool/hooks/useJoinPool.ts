import { useApiPost } from "../../api/methods.ts"
import { usePoolStore } from "../../common/stores/poolStore.ts"
import { Pool } from "../../common/models/Pool.ts"

export const useJoinPool = (poolCode: string) => {
    const { setPool } = usePoolStore()
    const apiPostCall = useApiPost<Pool>(`/pool/join/${poolCode}`)
    return () => {
        apiPostCall({}).then((pool) => {
            setPool(pool)
        })
    }
}
