import { CardBase } from "../../../common/components/cards/CardBase.tsx"
import { SpotifyPlaylist } from "../../models/SpotifyPlaylist.ts"
import { NameWithLink } from "../../../common/components/cards/NameWithLink.tsx"

interface SearchSpotifyPlaylistCardProps {
    playlist: SpotifyPlaylist
}

export const SearchSpotifyPlaylistCard = ({ playlist }: SearchSpotifyPlaylistCardProps) => {
    return (
        <CardBase>
            <img
                src={playlist.icon_link}
                alt={`Playlist: ${playlist.name} icon`}
                className="h-iconSize w-iconSize pointer-events-none select-none"
            />
            <div className="text-xs ">
                <NameWithLink resource={playlist} />
            </div>
        </CardBase>
    )
}
