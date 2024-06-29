import { useQuery } from "@tanstack/react-query"
import { useTokenStore } from "../stores/tokenStore.ts"
import { useGetPool } from "./useGetPool.ts"

export const useGetPoolQuery = () => {
    const { token } = useTokenStore()
    const getPool = useGetPool()
    console.log("useGetPoolQuery", token)
    useQuery({
        queryKey: ["get pool", token],
        queryFn: getPool,
        enabled: token !== null,
    })
}
