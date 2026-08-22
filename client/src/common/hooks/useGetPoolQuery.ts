import { skipToken, useQuery } from "@tanstack/react-query"
import { getPool } from "./getPool.ts"
import { useToken } from "../../api/tokenHolder.ts"

export const useGetPoolQuery = () => {
    const token = useToken()
    const getPoolCall = getPool()
    useQuery({
        queryKey: ["get pool", token],
        queryFn: token ? getPoolCall : skipToken,
    })
}
