import { SpotifyTrack } from "../../models/SpotifyTrack.ts"
import { ResourceWithArtistNameField } from "../../../common/components/cards/ResourceWithArtistNameField.tsx"
import { SearchResourceCard } from "./SearchResourceCard.tsx"

interface SearchSpotifyTrackCardProps {
    track: SpotifyTrack
}

export const SearchSpotifyTrackCard = ({ track }: SearchSpotifyTrackCardProps) => {
    return (
        <SearchResourceCard
            resource={track}
            iconSource={track.album}
            nameField={<ResourceWithArtistNameField track={track} artists={track.artists} />}
        />
    )
}
