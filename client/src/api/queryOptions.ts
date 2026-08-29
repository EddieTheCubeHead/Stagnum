import { queryOptions, skipToken } from "@tanstack/react-query"
import { apiGet } from "./methods.ts"
import { GeneralSpotifySearchResult } from "../search/models/GeneralSpotifySearchResult.ts"
import { getPool } from "./getPool.ts"
import { User } from "../common/models/User.ts"
import { fetchRedirectUri } from "./fetchRedirectUri.ts"
import { fetchToken } from "./fetchToken.ts"

export const spotifyGeneralSearchOptions = (query: string, token: string | null) => {
    const getPool = apiGet<GeneralSpotifySearchResult>("/search")
    return queryOptions({
        queryKey: ["generalSearch", query, token],
        queryFn: token ? async () => await getPool({ params: { query } }) : skipToken,
        enabled: query === "",
    })
}

export const getPoolOptions = (token: string | null) => {
    console.log("getPool", token)
    return queryOptions({
        queryKey: ["get pool", token],
        queryFn: token ? getPool() : skipToken,
    })
}

export const meQueryOptions = (token: string | null) => {
    const getFn = apiGet<User>("/me")
    return queryOptions({
        queryKey: ["me", token],
        // @ts-expect-error - hard to type both our object and TanStack's three override objects
        queryFn: token !== null ? getFn : skipToken,
        retry: 3,
        // We want to fail fast so user can re-log-in on stale token
        retryDelay: (attemptIndex) => Math.min(500 * 1.5 ** attemptIndex, 30000),
        staleTime: 10000,
    })
}

export const redirectUriOptions = () => {
    return queryOptions({ queryKey: ["redirect_uri"], queryFn: fetchRedirectUri })
}

export const tokenOptions = (code: string, state: string) => {
    return queryOptions({
        queryKey: ["token", code, state],
        // We only enable the query if both are non-null
        queryFn: () => fetchToken(code, state),
        staleTime: Infinity,
        select: (token) => ({ token: token?.access_token ?? undefined }),
    })
}
