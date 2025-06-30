import { useQuery } from "@tanstack/react-query"
import { useFetchToken } from "./useFetchToken.ts"

export const useGetTokenQuery = (code: string | null, state: string | null) => {
    const { data } = useQuery({
        queryKey: ["getToken", code, state],
        // We only enable the query if both are non-null
        queryFn: useFetchToken(code!, state!),
        enabled: code !== null && state !== null,
    })
    return data
}
