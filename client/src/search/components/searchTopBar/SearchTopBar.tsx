import { SearchTopBarTracksButton } from "./SearchTopBarTracksButton.tsx"
import { SearchTopBarAlbumsButton } from "./SearchTopBarAlbumsButton.tsx"
import { SearchTopBarArtistsButton } from "./SearchTopBarArtistsButton.tsx"
import { SearchTopBarPlaylistsButton } from "./SearchTopBarPlaylistsButton.tsx"
import { SubviewTopBar } from "../../../common/components/SubviewTopBar.tsx"

export const SearchTopBar = () => {
    return (
        <SubviewTopBar>
            <div className="flex grow max-w-96">
                <SearchTopBarTracksButton />
                <SearchTopBarAlbumsButton />
                <SearchTopBarArtistsButton />
                <SearchTopBarPlaylistsButton />
            </div>
        </SubviewTopBar>
    )
}
