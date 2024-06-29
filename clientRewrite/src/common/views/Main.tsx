import { TopBar } from "../components/TopBar.tsx"
import { EnsureLoginWrapper } from "../components/EnsureLoginWrapper.tsx"
import { Home } from "./Home.tsx"
import { ToolBar } from "../components/toolbar/ToolBar.tsx"
import { SearchSkeleton } from "../../search/components/SearchSkeleton.tsx"
import { useGetTokenQuery } from "../hooks/useGetTokenQuery.ts"

export const Main = () => {
    const query = new URLSearchParams(window.location.search)
    const code = query.get("code")
    const state = query.get("state")
    useGetTokenQuery(code, state)
    return (
        <div className="bg-background text-text min-h-screen font-default">
            <TopBar />
            {code === null || state === null ? <EnsureLoginWrapper view={<Home />} /> : <SearchSkeleton />}
            <ToolBar />
        </div>
    )
}
