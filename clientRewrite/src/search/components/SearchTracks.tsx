import { useSpotifyResourceQuery } from "../hooks/useSpotifyResourceQuery.ts"
import { SpotifyTrack } from "../types/SpotifyTrack.ts"
import { SearchSpotifyTrackCard } from "./cards/SearchSpotifyTrackCard.tsx"

export const SearchTracks = () => {
    const { data } = useSpotifyResourceQuery<SpotifyTrack>("tracks")
    return (
        <div className="flex-col space-y-1 p-2">
            {data?.items.map((track) => <SearchSpotifyTrackCard key={track.uri} track={track} />)}
        </div>
    )
}
