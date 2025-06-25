import { SearchTopBar } from "../components/searchTopBar/SearchTopBar.tsx"
import { SearchResults } from "../components/SearchResults.tsx"
import { useSpotifyGeneralQuery } from "../hooks/useSpotifyGeneralQuery.ts"
import { SearchSkeleton } from "../components/SearchSkeleton.tsx"

export const Search = () => {
    const { isLoading } = useSpotifyGeneralQuery()
    return (
        <div className="min-w-0 grow max-w-full basis-2/3 space-y-2 h-[calc(100vh-3rem)] overflow-y-auto">
            {isLoading ? (
                <SearchSkeleton />
            ) : (
                <>
                    <SearchTopBar />
                    <SearchResults />
                </>
            )}
        </div>
    )
}
