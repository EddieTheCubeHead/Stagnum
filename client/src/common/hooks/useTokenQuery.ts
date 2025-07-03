import { skipToken, useQuery } from "@tanstack/react-query"
import { useFetchToken } from "./useFetchToken.ts"
import { TOKEN } from "../constants/queryKey.ts"

interface UseGetTokenQueryProps {
    code?: string
    state?: string
}

export const useTokenQuery = ({ code, state }: UseGetTokenQueryProps = {}) => {
    const queryFn = (code: string, state: string) => useFetchToken(code, state)
    const { data, ...props } = useQuery({
        queryKey: [TOKEN],
        // We only enable the query if both are non-null
        queryFn: code && state ? queryFn(code, state) : skipToken,
        staleTime: Infinity,
        select: (token) => token.access_token,
    })

    return {
        token: data,
        ...props,
    }
}
