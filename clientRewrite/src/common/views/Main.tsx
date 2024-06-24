import { useTokenStore } from "../stores/tokenStore.ts"
import { fetchToken } from "../../api/fetchToken.ts"
import { TopBar } from "../components/TopBar.tsx"
import { useEffect } from "react"
import { CardsSkeleton } from "../components/CardsSkeleton.tsx"
import { EnsureLoginWrapper } from "../components/EnsureLoginWrapper.tsx"
import { Home } from "./Home.tsx"
import { ToolBar } from "../components/toolbar/ToolBar.tsx"

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
            {code === null || state === null ? <EnsureLoginWrapper view={<Home />} /> : <CardsSkeleton />}
            <ToolBar />
        </div>
    )
}
