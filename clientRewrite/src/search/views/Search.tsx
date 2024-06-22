import { SearchTracks } from "../components/SearchTracks.tsx"
import { SearchAlbums } from "../components/SearchAlbums.tsx"
import { SearchArtists } from "../components/SearchArtists.tsx"
import { SearchPlaylists } from "../components/SearchPlaylists.tsx"
import { SearchTopBar } from "../components/SearchTopBar.tsx"

export const Search = () => {
    return (
        <>
            <div className="max-h-full w-full flex-col">
                <SearchTopBar />
                <div className="overflow-y-auto">
                    <SearchTracks />
                    <SearchAlbums />
                    <SearchArtists />
                    <SearchPlaylists />
                </div>
            </div>
        </>
    )
}
