import { useApiPost } from "../../api/methods.ts"
import { usePoolStore } from "../../common/stores/poolStore.ts"

export const useJoinPool = (poolCode: string) => {
    const { setPool } = usePoolStore()
    const apiPostCall = useApiPost(`/pool/join/${poolCode}`)
    return () => {
        apiPostCall({}).then((pool) => {
            setPool(pool)
        })
    }
}
