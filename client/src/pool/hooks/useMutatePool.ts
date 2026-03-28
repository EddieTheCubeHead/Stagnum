import { Pool } from "../../common/models/Pool.ts"
import { useMutation } from "@tanstack/react-query"
import { usePoolStore } from "../../common/stores/poolStore.ts"
import { AxiosError } from "axios"

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
    const onMutate = optimisticOperation
        ? (variables: TVariables) => {
              setPool(pool ? optimisticOperation({ ...pool }, variables) : null)
              return pool
          }
        : undefined
    const onError = (_error: AxiosError, _variables: TVariables, pool: Pool | null | undefined) => {
        setPool(pool ?? null)
    }
    const onSuccess = (data: Pool | null, _variables: TVariables, _wtf: Pool | null | undefined) => {
        setPool(data)
    }
    return useMutation({
        mutationFn,
        mutationKey: [POOl_MUTATION, ...mutationKey],
        onMutate,
        onError,
        onSuccess,
    })
}
