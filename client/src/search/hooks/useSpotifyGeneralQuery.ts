import { useQuery } from "@tanstack/react-query"
import { useApiGet } from "../../api/methods.ts"
import { GeneralSpotifySearchResult } from "../models/GeneralSpotifySearchResult.ts"
import { useTokenQuery } from "../../common/hooks/useTokenQuery.ts"

interface UseSpotifyGeneralQueryProps {
    query: string
}

export const useSpotifyGeneralQuery = ({ query }: UseSpotifyGeneralQueryProps) => {
    const { token } = useTokenQuery()
    const fetchSpotifyGeneralSearch = useApiGet<GeneralSpotifySearchResult>("/search")
    return useQuery({
        queryKey: ["generalSearch", query, token],
        queryFn: () => fetchSpotifyGeneralSearch({ params: { query } }),
        enabled: query !== "",
    })
}
