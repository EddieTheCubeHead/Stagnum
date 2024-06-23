import { SearchTracks } from "../components/SearchTracks.tsx"
import { SearchAlbums } from "../components/SearchAlbums.tsx"
import { SearchArtists } from "../components/SearchArtists.tsx"
import { SearchPlaylists } from "../components/SearchPlaylists.tsx"
import { SearchTopBar } from "../components/SearchTopBar.tsx"

export const Search = () => {
    return (
        <>
            <div className="max-h-full w-full flex-col space-y-2">
                <SearchTopBar />
                <div className="overflow-y-auto space-y-1 pb-4">
                    <SearchTracks />
                    <SearchAlbums />
                    <SearchArtists />
                    <SearchPlaylists />
                </div>
            </div>
        </>
    )
}
