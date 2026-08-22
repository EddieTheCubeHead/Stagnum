import { useQuery } from "@tanstack/react-query"
import { apiGet } from "../../api/methods.ts"
import { GeneralSpotifySearchResult } from "../models/GeneralSpotifySearchResult.ts"
import { useToken } from "../../api/tokenHolder.ts"

interface UseSpotifyGeneralQueryProps {
    query: string
}

export const useSpotifyGeneralQuery = ({ query }: UseSpotifyGeneralQueryProps) => {
    const token = useToken()
    const fetchSpotifyGeneralSearch = apiGet<GeneralSpotifySearchResult>("/search")
    return useQuery({
        queryKey: ["generalSearch", query, token],
        queryFn: () => fetchSpotifyGeneralSearch({ params: { query } }),
        enabled: query !== "",
    })
}
