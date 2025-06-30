import { useTokenStore } from "../stores/tokenStore.ts"
import { useQuery } from "@tanstack/react-query"
import { User } from "../models/User.ts"
import { useApiGet } from "../../api/methods.ts"

export const useMeQuery = (): { user: User | undefined; error: Error | null; isLoading: boolean } => {
    const { token, setToken } = useTokenStore()
    const { data, error, isLoading } = useQuery({
        queryKey: ["me"],
        // @ts-expect-error - hard to type both our object and TanStack's three override objects
        queryFn: useApiGet<User>("/me"),
        enabled: token !== null,
        retry: 3,
        // We want to fail fast so user can re-log-in on stale token
        retryDelay: (attemptIndex) => Math.min(500 * 1.5 ** attemptIndex, 30000),
        staleTime: 10000,
    })

    if (error && token !== null) {
        setToken(null)
    }

    return { user: data as User | undefined, error, isLoading }
}
