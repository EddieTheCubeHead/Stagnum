import { useSearchStore } from "../../../common/stores/searchStore.ts"
import { SearchTopBarButton } from "./SearchTopBarButton.tsx"
import { AlbumIconSvg } from "../../../common/icons/svgs/AlbumIconSvg.tsx"

export const SearchTopBarAlbumsButton = () => {
    const searchStore = useSearchStore()
    const isFocused =
        !searchStore.isTracksOpened &&
        searchStore.isAlbumsOpened &&
        !searchStore.isArtistsOpened &&
        !searchStore.isPlaylistOpened
    return (
        <SearchTopBarButton
            title="Albums"
            svg={<AlbumIconSvg />}
            focusMethod={isFocused ? searchStore.openAll : searchStore.focusAlbums}
            isFocused={isFocused}
        />
    )
}
