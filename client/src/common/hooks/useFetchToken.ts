import { fetchToken } from "../../api/fetchToken.ts"

export const useFetchToken = (code: string, state: string) => {
    return async () => {
        return await fetchToken(code, state)
    }
}
