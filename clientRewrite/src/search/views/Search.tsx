import { SearchTopBar } from "../components/searchTopBar/SearchTopBar.tsx"
import { SearchResults } from "../components/SearchResults.tsx"
import { useSpotifyGeneralQuery } from "../hooks/useSpotifyGeneralQuery.ts"
import { SearchSkeleton } from "../components/SearchSkeleton.tsx"

export const Search = () => {
    const { isLoading } = useSpotifyGeneralQuery()
    return (
        <>
            {isLoading ? (
                <SearchSkeleton />
            ) : (
                <div className="max-h-full w-full flex-col space-y-2">
                    <SearchTopBar />
                    <SearchResults />
                </div>
            )}
        </>
    )
}
