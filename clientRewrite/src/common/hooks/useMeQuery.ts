import { useTokenStore } from "../stores/tokenStore.ts"
import { useQuery } from "@tanstack/react-query"
import { User } from "../models/User.ts"
import { useApiGet } from "../../api/methods.ts"

export const useMeQuery = (): { user: User; error: Error | null; isLoading: boolean } => {
    const { token, setToken } = useTokenStore()
    const { data, error, isLoading } = useQuery({
        queryKey: ["me", token],
        queryFn: useApiGet("/me"),
        enabled: token !== null,
        retry: 3,
        staleTime: 10000,
    })

    if (error) {
        setToken(null)
    }

    return { user: data, error, isLoading }
}
