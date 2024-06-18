import { useTokenStore } from "../common/stores/tokenStore.ts"
import { fetchToken } from "../login/api/fetchToken.ts"
import { Home } from "./Home.tsx"

export const Main = () => {
    const query = new URLSearchParams(window.location.search)
    const code = query.get("code")
    const state = query.get("state")
    const tokenStore = useTokenStore()
    if (code !== null && state !== null) {
        fetchToken(code, state).then((tokenData) => {
            tokenStore.setToken(tokenData.access_token)
            window.history.replaceState(null, "", window.location.pathname)
        })
    }
    return <Home />
}
