import { useQuery } from "@tanstack/react-query"
import { useTokenStore } from "../../common/stores/tokenStore.ts"
import { fetchSpotifyResource } from "../../api/fetchSpotifyResource.ts"
import { useSearchStore } from "../../common/stores/searchStore.ts"
import { PlayableSpotifyResource } from "../models/PlayableSpotifyResource.ts"

// Redundant for now but might be useful when implementing paging - leaving as is for now
export const useSpotifyResourceQuery = <TModel extends PlayableSpotifyResource>(
    resourceType: "tracks" | "albums" | "artists" | "playlists",
) => {
    const tokenStore = useTokenStore()
    const searchStore = useSearchStore()
    return useQuery({
        queryKey: [resourceType, searchStore.query, tokenStore.token],
        queryFn: () => fetchSpotifyResource<TModel>(resourceType, searchStore.query, tokenStore.token),
        enabled: searchStore.query !== "",
    })
}
