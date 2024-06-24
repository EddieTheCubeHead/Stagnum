import { useSearchStore } from "../../../common/stores/searchStore.ts"
import { SearchTopBarButton } from "./SearchTopBarButton.tsx"
import { ArtistIconSvg } from "../../../common/icons/svgs/ArtistIconSvg.tsx"

export const SearchTopBarArtistsButton = () => {
    const searchStore = useSearchStore()
    const isFocused =
        !searchStore.isTracksOpened &&
        !searchStore.isAlbumsOpened &&
        searchStore.isArtistsOpened &&
        !searchStore.isPlaylistOpened
    return (
        <SearchTopBarButton
            title="Artists"
            svg={<ArtistIconSvg />}
            focusMethod={isFocused ? searchStore.openAll : searchStore.focusArtists}
            isFocused={isFocused}
        />
    )
}
