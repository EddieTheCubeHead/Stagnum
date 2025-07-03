import { skipToken, useQuery, useQueryClient } from "@tanstack/react-query"
import { User } from "../models/User.ts"
import { useApiGet } from "../../api/methods.ts"
import { useTokenQuery } from "./useTokenQuery.ts"
import { TOKEN } from "../constants/queryKey.ts"

export const useMeQuery = (): { user: User | undefined; error: Error | null; isLoading: boolean } => {
    const { token } = useTokenQuery()
    const client = useQueryClient()
    const getFn = useApiGet<User>("/me")
    const { data, error, isLoading } = useQuery({
        queryKey: ["me"],
        // @ts-expect-error - hard to type both our object and TanStack's three override objects
        queryFn: token !== undefined ? getFn : skipToken,
        retry: 3,
        // We want to fail fast so user can re-log-in on stale token
        retryDelay: (attemptIndex) => Math.min(500 * 1.5 ** attemptIndex, 30000),
        staleTime: 10000,
    })

    if (error && token !== undefined) {
        client.setQueryData([TOKEN], { access_token: undefined })
    }

    return { user: data as User | undefined, error, isLoading }
}
