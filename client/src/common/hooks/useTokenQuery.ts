import { useQuery } from "@tanstack/react-query"
import { TOKEN } from "../constants/queryKey.ts"
import { fetchToken } from "../../api/fetchToken.ts"

interface UseGetTokenQueryProps {
    code?: string
    state?: string
}

export const useTokenQuery = ({ code, state }: UseGetTokenQueryProps = {}) => {
    const unwrappedQueryFn = (code?: string, state?: string) => () => fetchToken(code, state)
    const { data, ...props } = useQuery({
        queryKey: [TOKEN, code, state],
        // We only enable the query if both are non-null
        queryFn: unwrappedQueryFn(code, state),
        staleTime: Infinity,
        select: (token) => token?.access_token ?? undefined,
    })

    return {
        token: data,
        ...props,
    }
}
