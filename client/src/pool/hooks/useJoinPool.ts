import { useApiPost } from "../../api/methods.ts"
import { Pool } from "../../common/models/Pool.ts"
import { useCallback } from "react"

export const useJoinPool = (poolCode: string) => {
    const apiPostCall = useCallback(useApiPost<Pool>(`/pool/join/${poolCode}`), [poolCode])
    return async () => {
        return await apiPostCall({})
    }
}
