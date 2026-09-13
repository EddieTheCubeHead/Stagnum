import { Pool } from "../../common/models/Pool.ts"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { usePoolStore } from "../../common/stores/poolStore.ts"
import { AxiosError } from "axios"
import { useCallback, useMemo } from "react"
import { getPoolOptions } from "../../api/queryOptions.ts"
import { useToken } from "../../api/tokenHolder.ts"

export const POOl_MUTATION = "pool"

interface UseMutatePoolProps<TVariables> {
    mutationFn: (args: TVariables) => Promise<Pool | null>
    mutationKey?: unknown[] | undefined
    optimisticOperation?: (pool: Pool | null, variables: TVariables) => Pool | null
}

export const useMutatePool = <TVariables>({
    mutationFn,
    mutationKey = [],
    optimisticOperation,
}: UseMutatePoolProps<TVariables>) => {
    const { pool, setPool } = usePoolStore()
    const queryClient = useQueryClient()
    const token = useToken()
    const onMutate = useMemo(
        () =>
            optimisticOperation
                ? (variables: TVariables) => {
                      setPool(pool ? optimisticOperation({ ...pool }, variables) : null)
                      return pool
                  }
                : undefined,
        [optimisticOperation, pool, setPool],
    )
    const onError = useCallback(
        (_error: AxiosError, _variables: TVariables) => {
            void queryClient.invalidateQueries(getPoolOptions(token))
        },
        [pool, setPool],
    )
    const onSuccess = useCallback(
        (data: Pool | null) => {
            setPool(data)
        },
        [pool, setPool],
    )
    return useMutation({
        mutationFn,
        mutationKey: [POOl_MUTATION, ...mutationKey],
        onMutate,
        onError,
        onSuccess,
        scope: { id: "pool" },
    })
}
