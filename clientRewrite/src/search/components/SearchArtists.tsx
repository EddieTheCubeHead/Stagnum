import { useSpotifyResourceQuery } from "../hooks/useSpotifyResourceQuery.ts"
import { SpotifyTrack } from "../types/SpotifyTrack.ts"
import { useSearchStore } from "../../common/stores/searchStore.ts"
import { SearchCategoryTitleCard } from "./cards/SearchCategoryTitleCard.tsx"
import { Track } from "../../common/icons/Track.tsx"
import { SearchSpotifyTrackCard } from "./cards/SearchSpotifyTrackCard.tsx"

export const SearchArtists = () => {
    const { data } = useSpotifyResourceQuery<SpotifyTrack>("artists")
    const searchStore = useSearchStore()
    return (
        <div className="flex-col space-y-1 p-2">
            <SearchCategoryTitleCard
                title="Artists"
                icon={<Track />}
                isOpen={searchStore.isTracksOpened}
                setIsOpen={searchStore.setIsTracksOpened}
            />
            {searchStore.isTracksOpened ? (
                <div className="flex-col space-y-1 pl-8 pr-1">
                    {data?.items.map((track) => <SearchSpotifyTrackCard key={track.uri} track={track} />)}
                </div>
            ) : (
                <div className="flex-col pl-8 pr-1 relative -top-1">
                    <div className="bg-elementBackground-1 h-1 -top-2 rounded-b-md"></div>
                </div>
            )}
        </div>
    )
}
