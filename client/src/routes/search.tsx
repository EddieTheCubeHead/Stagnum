import { createFileRoute } from "@tanstack/react-router"
import { z } from "zod"
import { zodValidator } from "@tanstack/zod-adapter"
import { useSpotifyGeneralQuery } from "../search/hooks/useSpotifyGeneralQuery.ts"
import { SearchSkeleton } from "../search/components/SearchSkeleton.tsx"
import { SearchTopBar } from "../search/components/searchTopBar/SearchTopBar.tsx"
import { SearchResults } from "../search/components/SearchResults.tsx"
import { useSearchStates } from "../search/hooks/useSearchStates.ts"

const searchOpenedSchema = z.object({
    query: z.string(),
})

export const Route = createFileRoute("/search")({
    component: SearchQueryComponent,
    validateSearch: zodValidator(searchOpenedSchema),
})

function SearchQueryComponent() {
    const { query } = Route.useSearch()
    const { data, isLoading } = useSpotifyGeneralQuery({ query })
    const {
        toggleCategory,
        toggleFocus,
        tracks,
        artists,
        albums,
        playlists,
        isTracksFocused,
        isArtistsFocused,
        isAlbumsFocused,
        isPlaylistsFocused,
    } = useSearchStates()
    return (
        <div className="min-w-0 grow max-w-full basis-2/3 space-y-2 h-[calc(100vh-3rem)] overflow-y-auto">
            {isLoading || !data ? (
                <SearchSkeleton />
            ) : (
                <>
                    <SearchTopBar
                        toggleFocus={toggleFocus}
                        isTracksFocused={isTracksFocused}
                        isAlbumsFocused={isAlbumsFocused}
                        isArtistsFocused={isArtistsFocused}
                        isPlaylistsFocused={isPlaylistsFocused}
                    />
                    <SearchResults
                        results={data}
                        toggleCategory={toggleCategory}
                        tracks={tracks}
                        artists={artists}
                        albums={albums}
                        playlists={playlists}
                    />
                </>
            )}
        </div>
    )
}
