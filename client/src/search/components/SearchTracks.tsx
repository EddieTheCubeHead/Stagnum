import { SearchCategoryTitleCard } from "./cards/SearchCategoryTitleCard.tsx"
import { TrackIconSvg } from "../../common/icons/svgs/TrackIconSvg.tsx"
import { useSearchStore } from "../../common/stores/searchStore.ts"
import { useSpotifyGeneralQuery } from "../hooks/useSpotifyGeneralQuery.ts"
import { SearchSpotifyTrackCard } from "./cards/SearchSpotifyTrackCard.tsx"
import { SpotifyTrack } from "../models/SpotifyTrack.ts"

export const SearchTracks = () => {
    const { data } = useSpotifyGeneralQuery()
    const searchStore = useSearchStore()
    return (
        <div className="flex-col px-2">
            <SearchCategoryTitleCard
                title="Tracks"
                iconSvg={<TrackIconSvg />}
                isOpen={searchStore.isTracksOpened}
                setIsOpen={searchStore.setIsTracksOpened}
            />
            {searchStore.isTracksOpened ? (
                <div className="flex-col space-y-1 pl-10 pr-1 pt-1">
                    {data?.tracks.items.map((track: SpotifyTrack) => (
                        <SearchSpotifyTrackCard key={track.uri} track={track} />
                    ))}
                </div>
            ) : (
                <div className="flex-col pl-10 pr-1 select-none">
                    <div className="bg-elementBackground-1 h-1 -top-2 rounded-b-md"></div>
                </div>
            )}
        </div>
    )
}
