import { SearchTopBarButton } from "./SearchTopBarButton.tsx"
import { PlaylistIconSvg } from "../../../common/icons/svgs/PlaylistIconSvg.tsx"
import { useSearchStates } from "../../hooks/useSearchStates.ts"

export const SearchTopBarPlaylistsButton = () => {
    const { toggleTopBar, onlyPlaylistsOpen } = useSearchStates()
    return (
        <SearchTopBarButton
            title="Playlists"
            svg={<PlaylistIconSvg />}
            focusMethod={() => toggleTopBar("playlists")}
            isFocused={onlyPlaylistsOpen}
        />
    )
}
