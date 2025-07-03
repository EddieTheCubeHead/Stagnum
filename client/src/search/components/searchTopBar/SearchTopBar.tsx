import { SubviewTopBar } from "../../../common/components/SubviewTopBar.tsx"
import { PlaylistIconSvg } from "../../../common/icons/svgs/PlaylistIconSvg.tsx"
import { SearchTopBarButton } from "./SearchTopBarButton.tsx"
import { toggledCategory } from "../../hooks/useSearchStates.ts"
import { TrackIconSvg } from "../../../common/icons/svgs/TrackIconSvg.tsx"
import { AlbumIconSvg } from "../../../common/icons/svgs/AlbumIconSvg.tsx"
import { ArtistIconSvg } from "../../../common/icons/svgs/ArtistIconSvg.tsx"

interface SearchTopBarProps {
    toggleFocus: (category: toggledCategory) => void
    isTracksFocused: boolean
    isAlbumsFocused: boolean
    isArtistsFocused: boolean
    isPlaylistsFocused: boolean
}

export const SearchTopBar = ({
    toggleFocus,
    isTracksFocused,
    isAlbumsFocused,
    isArtistsFocused,
    isPlaylistsFocused,
}: SearchTopBarProps) => {
    return (
        <SubviewTopBar>
            <div className="flex grow max-w-96">
                <SearchTopBarButton
                    title="Tracks"
                    svg={<TrackIconSvg />}
                    focusMethod={() => toggleFocus("tracks")}
                    isFocused={isTracksFocused}
                />
                <SearchTopBarButton
                    title="Albums"
                    svg={<AlbumIconSvg />}
                    focusMethod={() => toggleFocus("albums")}
                    isFocused={isAlbumsFocused}
                />
                <SearchTopBarButton
                    title="Artists"
                    svg={<ArtistIconSvg />}
                    focusMethod={() => toggleFocus("artists")}
                    isFocused={isArtistsFocused}
                />
                <SearchTopBarButton
                    title="Playlists"
                    svg={<PlaylistIconSvg />}
                    focusMethod={() => toggleFocus("playlists")}
                    isFocused={isPlaylistsFocused}
                />
            </div>
        </SubviewTopBar>
    )
}
