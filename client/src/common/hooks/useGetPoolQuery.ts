import { skipToken, useQuery } from "@tanstack/react-query"
import { useGetPool } from "./useGetPool.ts"
import { useTokenQuery } from "./useTokenQuery.ts"

export const useGetPoolQuery = () => {
    const { token } = useTokenQuery()
    const getPool = useGetPool()
    useQuery({
        queryKey: ["get pool", token],
        queryFn: token ? getPool : skipToken,
    })
}
