import { useSearchStore } from "../../../common/stores/searchStore.ts"
import { SearchTopBarButton } from "./SearchTopBarButton.tsx"
import { PlaylistIconSvg } from "../../../common/icons/svgs/PlaylistIconSvg.tsx"

export const SearchTopBarPlaylistsButton = () => {
    const searchStore = useSearchStore()
    const isFocused =
        !searchStore.isTracksOpened &&
        !searchStore.isAlbumsOpened &&
        !searchStore.isArtistsOpened &&
        searchStore.isPlaylistOpened
    return (
        <SearchTopBarButton
            title="Playlists"
            svg={<PlaylistIconSvg />}
            focusMethod={isFocused ? searchStore.openAll : searchStore.focusPlaylists}
            isFocused={isFocused}
        />
    )
}
