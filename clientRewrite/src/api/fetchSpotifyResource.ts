import { get } from "./methods.ts"
import { PlayableSpotifyResource } from "../search/models/PlayableSpotifyResource.ts"
import { PaginatedSpotifySearchResult } from "../search/models/PaginatedSpotifySearchResult.ts"

export const fetchSpotifyResource = async <TModel extends PlayableSpotifyResource>(
    resource: "tracks" | "albums" | "artists" | "playlists",
    query: string,
    token: string | null,
): Promise<PaginatedSpotifySearchResult<TModel> | null> => {
    if (!token) {
        return null
    }

    const result = await get(`/search/${resource}`, token, { query })
    return result.data
}
