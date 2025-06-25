import { SpotifyArtist } from "../../models/SpotifyArtist.ts"
import { SearchResourceCard } from "./SearchResourceCard.tsx"
import { CardText } from "../../../common/components/cards/CardText.tsx"
import { Size } from "../../../common/constants/size.ts"

interface SearchSpotifyArtistCardProps {
    artist: SpotifyArtist
}

export const SearchSpotifyArtistCard = ({ artist }: SearchSpotifyArtistCardProps) => {
    return (
        <SearchResourceCard
            resource={artist}
            iconSource={artist}
            nameField={<CardText text={artist.name} title={artist.name} link={artist.link} size={Size.s} />}
        />
    )
}
