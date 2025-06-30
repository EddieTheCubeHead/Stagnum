import { fetchToken } from "../../api/fetchToken.ts"
import { useTokenStore } from "../stores/tokenStore.ts"

export const useFetchToken = (code: string, state: string) => {
    const { setToken } = useTokenStore()
    return async () => {
        const tokenData = await fetchToken(code, state)
        setToken(tokenData.access_token)
        window.history.replaceState(null, "", window.location.pathname)
        return tokenData
    }
}
