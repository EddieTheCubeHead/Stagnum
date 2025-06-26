import { fetchToken } from "../../api/fetchToken.ts"
import { useTokenStore } from "../stores/tokenStore.ts"

export const useFetchToken = (code: string, state: string) => {
    const { setToken } = useTokenStore()
    return () => {
        fetchToken(code, state).then((tokenData) => {
            setToken(tokenData.access_token)
            window.history.replaceState(null, "", window.location.pathname)
            return tokenData
        })
        return null
    }
}
