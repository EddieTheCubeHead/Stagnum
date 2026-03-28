import { usePoolStore } from "../../common/stores/poolStore.ts"
import { useCallback } from "react"
import { useApiDelete } from "../../api/methods.ts"
import { Pool } from "../../common/models/Pool.ts"
import { useAlertStore } from "../../alertSystem/alertStore.ts"
import { AlertType } from "../../alertSystem/Alert.ts"
import { PoolMember } from "../../common/models/PoolMember.ts"
import { useTokenQuery } from "../../common/hooks/useTokenQuery.ts"

export const useDeletePoolContent = (resource: PoolMember) => {
    const { setPool } = usePoolStore()
    const { token } = useTokenQuery()
    const { addAlert } = useAlertStore()
    const deletePoolContent = useApiDelete<Pool>(`/pool/content/${resource.id}`)
    const mutationFn = useCallback(async () => {
        if (token === undefined) {
            throw new Error("Token null on pool addition!")
        }
        const poolData = await deletePoolContent()
        addAlert({ type: AlertType.Success, message: `Deleted "${resource.name}" from pool` })
        return poolData
    }, [resource, token])
    const optimisticOperation = useCallback(
        (pool: Pool | null): Pool | null => {
            if (pool === null) {
                return null
            }
            return {
                ...pool,
                users: pool.users.map((user) => {
                    return {
                        ...user,
                        collections: user.collections
                            .filter((collection) => collection.id !== resource.id)
                            .map((collection) => {
                                return {
                                    ...collection,
                                    tracks: collection.tracks.filter((track) => track.id !== resource.id),
                                }
                            }),
                        tracks: user.tracks.filter((track) => track.id !== resource.id),
                    }
                }),
            }
        },
        [resource, setPool],
    )

    return { mutationFn, optimisticOperation }
}
