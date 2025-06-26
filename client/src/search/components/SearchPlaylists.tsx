import { useSearchStore } from "../../common/stores/searchStore.ts"
import { SearchCategoryTitleCard } from "./cards/SearchCategoryTitleCard.tsx"
import { PlaylistIconSvg } from "../../common/icons/svgs/PlaylistIconSvg.tsx"
import { SearchSpotifyPlaylistCard } from "./cards/SearchSpotifyPlaylistCard.tsx"
import { useSpotifyGeneralQuery } from "../hooks/useSpotifyGeneralQuery.ts"
import { SpotifyPlaylist } from "../models/SpotifyPlaylist.ts"

export const SearchPlaylists = () => {
    const { data } = useSpotifyGeneralQuery()
    const searchStore = useSearchStore()
    return (
        <div className="flex-col px-2">
            <SearchCategoryTitleCard
                title="Playlists"
                iconSvg={<PlaylistIconSvg />}
                isOpen={searchStore.isPlaylistsOpened}
                setIsOpen={searchStore.setIsPlaylistOpened}
            />
            {searchStore.isPlaylistsOpened ? (
                <div className="flex-col space-y-1 pl-10 pr-1 pt-1">
                    {data?.playlists.items.map((playlist: SpotifyPlaylist) => (
                        <SearchSpotifyPlaylistCard key={playlist.uri} playlist={playlist} />
                    ))}
                </div>
            ) : (
                <div className="flex-col pl-10 pr-1">
                    <div className="bg-elementBackground-1 h-1 -top-2 rounded-b-md"></div>
                </div>
            )}
        </div>
    )
}
