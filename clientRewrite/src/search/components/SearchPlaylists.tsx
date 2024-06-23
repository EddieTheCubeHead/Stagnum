import { useSpotifyResourceQuery } from "../hooks/useSpotifyResourceQuery.ts"
import { useSearchStore } from "../../common/stores/searchStore.ts"
import { SearchCategoryTitleCard } from "./cards/SearchCategoryTitleCard.tsx"
import { SpotifyPlaylist } from "../types/SpotifyPlaylist.ts"
import { Playlist } from "../../common/icons/Playlist.tsx"
import { SearchSpotifyPlaylistCard } from "./cards/SearchSpotifyPlaylistCard.tsx"

export const SearchPlaylists = () => {
    const { data } = useSpotifyResourceQuery<SpotifyPlaylist>("playlists")
    const searchStore = useSearchStore()
    return (
        <div className="flex-col space-y-1 px-2">
            <SearchCategoryTitleCard
                title="Playlists"
                icon={<Playlist />}
                isOpen={searchStore.isPlaylistOpened}
                setIsOpen={searchStore.setIsPlaylistOpened}
            />
            {searchStore.isPlaylistOpened ? (
                <div className="flex-col space-y-1 pl-8 pr-1">
                    {data?.items.map((playlist) => (
                        <SearchSpotifyPlaylistCard key={playlist.uri} playlist={playlist} />
                    ))}
                </div>
            ) : (
                <div className="flex-col pl-8 pr-1 relative -top-1">
                    <div className="bg-elementBackground-1 h-1 -top-2 rounded-b-md"></div>
                </div>
            )}
        </div>
    )
}
