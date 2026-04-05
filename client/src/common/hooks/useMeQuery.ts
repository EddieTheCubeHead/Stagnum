import { skipToken, useQuery } from "@tanstack/react-query"
import { User } from "../models/User.ts"
import { useApiGet } from "../../api/methods.ts"
import { useTokenQuery } from "./useTokenQuery.ts"
import { useLogOut } from "./useLogOut.ts"

export const useMeQuery = (): { user: User | undefined; error: Error | null; isLoading: boolean } => {
    const logOut = useLogOut()
    const { token } = useTokenQuery()
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
        void logOut()
    }

    return { user: data as User | undefined, error, isLoading }
}
