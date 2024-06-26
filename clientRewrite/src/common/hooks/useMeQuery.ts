import { useTokenStore } from "../stores/tokenStore.ts"
import { useQuery } from "@tanstack/react-query"
import { fetchMe } from "../../api/fetchMe.ts"
import { User } from "../models/User.ts"

export const useMeQuery = (): { user: User; error: Error | null; isLoading: boolean } => {
    const tokenStore = useTokenStore()
    const { data, error, isLoading } = useQuery({
        queryKey: ["me", tokenStore.token],
        queryFn: () => fetchMe(tokenStore.token),
        retry: 3,
        staleTime: 60000,
    })

    if (error) {
        tokenStore.setToken(null)
    }

    return { user: data, error, isLoading }
}
