import { CardBase } from "../../../common/components/cards/CardBase.tsx"
import { TrackAndArtistsNameField } from "../../../common/components/cards/TrackAndArtistsNameField.tsx"
import { SpotifyAlbum } from "../../models/SpotifyAlbum.ts"

interface SearchSpotifyAlbumCardProps {
    album: SpotifyAlbum
}

export const SearchSpotifyAlbumCard = ({ album }: SearchSpotifyAlbumCardProps) => {
    return (
        <CardBase>
            <img
                src={album.icon_link}
                alt={`Album: ${album.name} icon`}
                className="h-iconSize w-iconSize pointer-events-none select-none"
            />
            <TrackAndArtistsNameField track={album} artists={album.artists} />
        </CardBase>
    )
}
