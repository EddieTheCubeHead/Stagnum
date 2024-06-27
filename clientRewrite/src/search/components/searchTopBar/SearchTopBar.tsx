import { SearchTopBarTracksButton } from "./SearchTopBarTracksButton.tsx"
import { SearchTopBarAlbumsButton } from "./SearchTopBarAlbumsButton.tsx"
import { SearchTopBarArtistsButton } from "./SearchTopBarArtistsButton.tsx"
import { SearchTopBarPlaylistsButton } from "./SearchTopBarPlaylistsButton.tsx"
import { SubviewTopBar } from "../../../common/components/SubviewTopBar.tsx"

export const SearchTopBar = () => {
    return (
        <SubviewTopBar>
            <div className="flex relative">
                <SearchTopBarTracksButton />
                <SearchTopBarAlbumsButton />
                <SearchTopBarArtistsButton />
                <SearchTopBarPlaylistsButton />
            </div>
        </SubviewTopBar>
    )
}
