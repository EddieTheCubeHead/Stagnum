import { SearchCategoryTitleCard } from "./cards/SearchCategoryTitleCard.tsx"
import { TrackIconSvg } from "../../common/icons/svgs/TrackIconSvg.tsx"
import { SearchSpotifyTrackCard } from "./cards/SearchSpotifyTrackCard.tsx"
import { SpotifyTrack } from "../models/SpotifyTrack.ts"
import { GeneralSpotifySearchResult } from "../models/GeneralSpotifySearchResult.ts"

interface SearchTracksProps {
    tracks: GeneralSpotifySearchResult["tracks"]
    isOpen: boolean
    toggleOpen: () => void
}

export const SearchTracks = ({ tracks, isOpen, toggleOpen }: SearchTracksProps) => {
    return (
        <div className="flex-col px-2">
            <SearchCategoryTitleCard title="Tracks" iconSvg={<TrackIconSvg />} isOpen={isOpen} setIsOpen={toggleOpen} />
            {isOpen ? (
                <div className="flex-col space-y-1 pl-10 pr-1 pt-1">
                    {tracks.items.map((track: SpotifyTrack) => (
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
