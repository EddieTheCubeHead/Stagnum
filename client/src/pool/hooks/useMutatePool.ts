import { Pool } from "../../common/models/Pool.ts"
import { useMutation } from "@tanstack/react-query"
import { usePoolStore } from "../../common/stores/poolStore.ts"
import { AxiosError } from "axios"
import { useCallback, useMemo } from "react"
import { useAlertStore } from "../../alertSystem/alertStore.ts"
import { AlertType } from "../../alertSystem/Alert.ts"

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
    const { addAlert } = useAlertStore()
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
        (error: AxiosError, _variables: TVariables, pool: Pool | null | undefined) => {
            // @ts-expect-error problems with typing axios errors
            addAlert({ type: AlertType.Error, message: error.response?.data.error })
            setPool(pool ?? null)
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
    })
}
