import { SpotifyArtist } from "../../models/SpotifyArtist.ts"
import { NameWithLink } from "../../../common/components/cards/NameWithLink.tsx"
import { SearchResourceCard } from "./SearchResourceCard.tsx"

interface SearchSpotifyArtistCardProps {
    artist: SpotifyArtist
}

export const SearchSpotifyArtistCard = ({ artist }: SearchSpotifyArtistCardProps) => {
    return (
        <SearchResourceCard
            iconSource={artist}
            nameField={
                <div className="text-xs ">
                    <NameWithLink resource={artist} />
                </div>
            }
        />
    )
}
