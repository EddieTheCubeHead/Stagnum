import { queryOptions, skipToken } from "@tanstack/react-query"
import { apiGet } from "./methods.ts"
import { GeneralSpotifySearchResult } from "../search/models/GeneralSpotifySearchResult.ts"
import { User } from "../common/models/User.ts"
import { fetchRedirectUri } from "./fetchRedirectUri.ts"
import { fetchToken } from "./fetchToken.ts"
import { getPool } from "./getPool.ts"

export const spotifyGeneralSearchOptions = (query: string, token: string | null) => {
    const getSearch = apiGet<GeneralSpotifySearchResult>("/search")
    return queryOptions({
        queryKey: ["generalSearch", query, token],
        queryFn: token ? () => getSearch({ params: { query } }) : skipToken,
        enabled: query !== "",
    })
}

export const getPoolOptions = (token: string | null) => {
    return queryOptions({
        queryKey: ["get pool", token],
        queryFn: token ? getPool() : skipToken,
    })
}

export const meQueryOptions = (token: string | null) => {
    const getFn = apiGet<User>("/me")
    return queryOptions({
        queryKey: ["me", token],
        queryFn: token ? () => getFn() : skipToken,
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
        select: (token) => ({ token: token?.access_token ?? undefined }),
    })
}
