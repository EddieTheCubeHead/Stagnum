import { SearchCategoryTitleCard } from "./cards/SearchCategoryTitleCard.tsx"
import { Track } from "../../common/icons/Track.tsx"
import { useSearchStore } from "../../common/stores/searchStore.ts"
import { useSpotifyGeneralQuery } from "../hooks/useSpotifyGeneralQuery.ts"
import { SearchSpotifyPlaylistCard } from "./cards/SearchSpotifyPlaylistCard.tsx"

export const SearchTracks = () => {
    const { data } = useSpotifyGeneralQuery()
    const searchStore = useSearchStore()
    return (
        <div className="flex-col space-y-1 px-2">
            <SearchCategoryTitleCard
                title="Tracks"
                icon={<Track />}
                isOpen={searchStore.isTracksOpened}
                setIsOpen={searchStore.setIsTracksOpened}
            />
            {searchStore.isTracksOpened ? (
                <div className="flex-col space-y-1 pl-8 pr-1">
                    {data?.playlists.items.map((playlist) => (
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
