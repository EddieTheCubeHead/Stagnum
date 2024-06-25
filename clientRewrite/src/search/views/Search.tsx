import { SearchTopBar } from "../components/searchTopBar/SearchTopBar.tsx"
import { SearchResults } from "../components/SearchResults.tsx"
import { useSpotifyGeneralQuery } from "../hooks/useSpotifyGeneralQuery.ts"
import { SearchSkeleton } from "../components/SearchSkeleton.tsx"

export const Search = () => {
    const { isLoading } = useSpotifyGeneralQuery()
    return (
        <div className="grow max-w-full basis-2/3 flex-col space-y-2 overflow-y-auto">
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
