import { useTokenStore } from "../stores/tokenStore.ts"
import { useQuery } from "@tanstack/react-query"
import { fetchMe } from "../../api/fetchMe.ts"

export const useMeQuery = () => {
    const tokenStore = useTokenStore()
    const { data, error } = useQuery({
        queryKey: ["me", tokenStore.token],
        queryFn: () => fetchMe(tokenStore.token),
        retry: 3,
    })

    if (error) {
        tokenStore.setToken(null)
    }

    return data
}
