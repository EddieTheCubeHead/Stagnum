import { CardBase } from "../../../common/components/cards/CardBase.tsx"
import { SpotifyArtist } from "../../models/SpotifyArtist.ts"
import { NameWithLink } from "../../../common/components/cards/NameWithLink.tsx"

interface SearchSpotifyArtistCardProps {
    artist: SpotifyArtist
}

export const SearchSpotifyArtistCard = ({ artist }: SearchSpotifyArtistCardProps) => {
    return (
        <CardBase>
            <img
                src={artist.icon_link}
                alt={`Artist: ${artist.name} image`}
                className="h-iconSize w-iconSize pointer-events-none select-none"
            />
            <div className="text-sm">
                <NameWithLink resource={artist} />
            </div>
        </CardBase>
    )
}
