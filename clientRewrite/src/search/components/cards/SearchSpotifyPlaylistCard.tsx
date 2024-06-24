import { SpotifyPlaylist } from "../../models/SpotifyPlaylist.ts"
import { NameWithLink } from "../../../common/components/cards/NameWithLink.tsx"
import { SearchResourceCard } from "./SearchResourceCard.tsx"

interface SearchSpotifyPlaylistCardProps {
    playlist: SpotifyPlaylist
}

export const SearchSpotifyPlaylistCard = ({ playlist }: SearchSpotifyPlaylistCardProps) => {
    return (
        <SearchResourceCard
            iconSource={playlist}
            nameField={
                <div className="text-xs ">
                    <NameWithLink resource={playlist} />
                </div>
            }
        />
    )
}
