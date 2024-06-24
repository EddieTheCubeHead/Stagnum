import { get } from "./methods.ts"
import { GeneralSpotifySearchResult } from "../search/models/GeneralSpotifySearchResult.ts"

export const fetchSpotifyGeneralSearch = async (
    query: string,
    token: string | null,
): Promise<GeneralSpotifySearchResult | null> => {
    if (!token) {
        return null
    }

    const result = await get(`/search`, token, { query })
    return result.data
}
