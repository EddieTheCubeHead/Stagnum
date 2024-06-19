import { useTokenStore } from "../common/stores/tokenStore.ts"
import { fetchToken } from "../api/fetchToken.ts"
import { Home } from "./Home.tsx"
import { TopBar } from "../common/components/TopBar.tsx"
import { useEffect } from "react"
import { CardsSkeleton } from "../common/components/CardsSkeleton.tsx"

export const Main = () => {
    const query = new URLSearchParams(window.location.search)
    const code = query.get("code")
    const state = query.get("state")
    const tokenStore = useTokenStore()
    useEffect(() => {
        if (code !== null && state !== null) {
            fetchToken(code, state).then((tokenData) => {
                tokenStore.setToken(tokenData.access_token)
                window.history.replaceState(null, "", window.location.pathname)
            })
        }
    }, [code, state])
    return (
        <div className="bg-background text-text min-h-screen font-default">
            <TopBar />
            {code === null || state === null ? <Home /> : <CardsSkeleton />}
        </div>
    )
}
