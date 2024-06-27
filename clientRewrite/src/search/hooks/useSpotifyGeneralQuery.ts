import { useTokenStore } from "../../common/stores/tokenStore.ts"
import { useSearchStore } from "../../common/stores/searchStore.ts"
import { useQuery } from "@tanstack/react-query"
import { useApiGet } from "../../api/methods.ts"

export const useSpotifyGeneralQuery = () => {
    const { token } = useTokenStore()
    const { query } = useSearchStore()
    const fetchSpotifyGeneralSearch = useApiGet("/search")
    return useQuery({
        queryKey: ["generalSearch", query, token],
        queryFn: () => fetchSpotifyGeneralSearch({ query }),
        enabled: query !== "",
    })
}
