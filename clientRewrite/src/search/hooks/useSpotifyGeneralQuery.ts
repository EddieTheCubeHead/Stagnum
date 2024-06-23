import { useTokenStore } from "../../common/stores/tokenStore.ts"
import { useSearchStore } from "../../common/stores/searchStore.ts"
import { useQuery } from "@tanstack/react-query"
import { fetchSpotifyGeneralSearch } from "../../api/fetchSpotifyGeneralSearch.ts"

export const useSpotifyGeneralQuery = () => {
    const tokenStore = useTokenStore()
    const searchStore = useSearchStore()
    return useQuery({
        queryKey: ["generalSearch", searchStore.query, tokenStore.token],
        queryFn: () => fetchSpotifyGeneralSearch(searchStore.query, tokenStore.token),
        enabled: searchStore.query !== "",
    })
}
