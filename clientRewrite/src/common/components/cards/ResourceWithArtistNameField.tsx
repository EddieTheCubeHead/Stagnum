import { NamedSpotifyResource } from "../../models/NamedSpotifyResource.ts"
import { CardText } from "./CardText.tsx"
import { Size } from "../../constants/size.ts"

interface TrackAndArtistsNameFieldProps {
    track: NamedSpotifyResource
    artists: NamedSpotifyResource[]
}

export const ResourceWithArtistNameField = ({ track, artists }: TrackAndArtistsNameFieldProps) => {
    const artistNames = artists.map((artist) => artist.name).join(", ")
    return (
        <div className="flex-col text-xs select-none">
            <div className="flex">
                <CardText size={Size.s} text={track.name} title={track.name} link={track.link} />
            </div>
            <div className="flex space-x-2 max-w-44">
                {artists.map((artist: NamedSpotifyResource) => (
                    <CardText
                        key={track.link + artist.link}
                        text={artist.name}
                        title={artistNames}
                        link={artist.link}
                        size={Size.xs}
                    />
                ))}
            </div>
        </div>
    )
}
