import { SearchTopBarTracksButton } from "./SearchTopBarTracksButton.tsx"
import { SearchTopBarAlbumsButton } from "./SearchTopBarAlbumsButton.tsx"
import { SearchTopBarArtistsButton } from "./SearchTopBarArtistsButton.tsx"
import { SearchTopBarPlaylistsButton } from "./SearchTopBarPlaylistsButton.tsx"

export const SearchTopBar = () => {
    return (
        <div className="bg-elementBackground-2 w-full rounded-b-md z-20 sticky flex top-bigCardHeight h-cardHeight drop-shadow-2xl justify-center">
            <SearchTopBarTracksButton />
            <SearchTopBarAlbumsButton />
            <SearchTopBarArtistsButton />
            <SearchTopBarPlaylistsButton />
        </div>
    )
}
