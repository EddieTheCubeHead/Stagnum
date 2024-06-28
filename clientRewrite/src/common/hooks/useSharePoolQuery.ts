import { useQuery } from "@tanstack/react-query"
import { usePostSharePool } from "./usePostSharePool.ts"

export const useSharePoolQuery = () => {
    useQuery({
        queryKey: ["share pool"],
        queryFn: usePostSharePool(),
        retry: 1,
    })
}
