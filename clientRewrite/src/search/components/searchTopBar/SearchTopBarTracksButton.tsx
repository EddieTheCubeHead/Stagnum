import { SearchTopBarButton } from "./SearchTopBarButton.tsx"
import { TrackIconSvg } from "../../../common/icons/svgs/TrackIconSvg.tsx"
import { useSearchStore } from "../../../common/stores/searchStore.ts"

export const SearchTopBarTracksButton = () => {
    const searchStore = useSearchStore()
    const isFocused =
        searchStore.isTracksOpened &&
        !searchStore.isAlbumsOpened &&
        !searchStore.isArtistsOpened &&
        !searchStore.isPlaylistOpened
    return (
        <SearchTopBarButton
            title="Tracks"
            svg={<TrackIconSvg />}
            focusMethod={isFocused ? searchStore.openAll : searchStore.focusTracks}
            isFocused={isFocused}
        />
    )
}
