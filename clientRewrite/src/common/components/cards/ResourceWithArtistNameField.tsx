import { NamedSpotifyResource } from "../../models/NamedSpotifyResource.ts"
import { NameWithLink } from "./NameWithLink.tsx"

interface TrackAndArtistsNameFieldProps {
    track: NamedSpotifyResource
    artists: NamedSpotifyResource[]
}

export const ResourceWithArtistNameField = ({ track, artists }: TrackAndArtistsNameFieldProps) => {
    return (
        <div className="flex-col text-xs select-none">
            <NameWithLink resource={track} />
            <div className="flex text-xxs font-extralight space-x-2">
                {artists.map((artist: NamedSpotifyResource) => (
                    <NameWithLink key={track.link + artist.link} resource={artist} />
                ))}
            </div>
        </div>
    )
}
