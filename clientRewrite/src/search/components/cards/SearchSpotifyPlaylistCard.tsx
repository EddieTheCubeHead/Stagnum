import { SpotifyPlaylist } from "../../models/SpotifyPlaylist.ts"
import { SearchResourceCard } from "./SearchResourceCard.tsx"
import { CardText } from "../../../common/components/cards/CardText.tsx"
import { Size } from "../../../common/constants/size.ts"

interface SearchSpotifyPlaylistCardProps {
    playlist: SpotifyPlaylist
}

export const SearchSpotifyPlaylistCard = ({ playlist }: SearchSpotifyPlaylistCardProps) => {
    return (
        <SearchResourceCard
            resource={playlist}
            iconSource={playlist}
            nameField={
                <div className="text-xs ">
                    <CardText text={playlist.name} title={playlist.name} link={playlist.link} size={Size.s} />
                </div>
            }
        />
    )
}
