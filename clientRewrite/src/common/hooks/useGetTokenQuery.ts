import { useQuery } from "@tanstack/react-query"
import { useFetchToken } from "./useFetchToken.ts"

export const useGetTokenQuery = (code: string | null, state: string | null) => {
    useQuery({
        queryKey: ["getToken", code, state],
        // @ts-expect-error - hard to type both our object and TanStack's three override objects
        queryFn: useFetchToken(code, state),
        enabled: code !== null && state !== null,
    })
}
