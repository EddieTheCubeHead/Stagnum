import { SearchTracks } from "./SearchTracks.tsx"
import { SearchAlbums } from "./SearchAlbums.tsx"
import { SearchArtists } from "./SearchArtists.tsx"
import { SearchPlaylists } from "./SearchPlaylists.tsx"

export const SearchResults = () => {
    return (
        <div className="overflow-y-auto space-y-1 pb-4">
            <SearchTracks />
            <SearchAlbums />
            <SearchArtists />
            <SearchPlaylists />
        </div>
    )
}
