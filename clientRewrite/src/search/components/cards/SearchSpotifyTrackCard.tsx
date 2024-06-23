import { SpotifyTrack } from "../../types/SpotifyTrack.ts"
import { CardBase } from "../../../common/components/cards/CardBase.tsx"
import { TrackAndArtistsNameField } from "../../../common/components/cards/TrackAndArtistsNameField.tsx"

interface SearchSpotifyTrackCardProps {
    track: SpotifyTrack
}

export const SearchSpotifyTrackCard = ({ track }: SearchSpotifyTrackCardProps) => {
    return (
        <CardBase>
            <img
                src={track.album.icon_link}
                alt={`Album: ${track.album.name} icon for track ${track.name}`}
                className="h-iconSize w-iconSize pointer-events-none select-none"
            />
            <TrackAndArtistsNameField track={track} artists={track.artists} />
        </CardBase>
    )
}
