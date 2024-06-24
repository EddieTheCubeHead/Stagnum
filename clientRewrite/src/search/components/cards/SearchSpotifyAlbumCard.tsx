import { ResourceWithArtistNameField } from "../../../common/components/cards/ResourceWithArtistNameField.tsx"
import { SpotifyAlbum } from "../../models/SpotifyAlbum.ts"
import { SearchResourceCard } from "./SearchResourceCard.tsx"

interface SearchSpotifyAlbumCardProps {
    album: SpotifyAlbum
}

export const SearchSpotifyAlbumCard = ({ album }: SearchSpotifyAlbumCardProps) => {
    return (
        <SearchResourceCard
            iconSource={album}
            nameField={<ResourceWithArtistNameField track={album} artists={album.artists} />}
        />
    )
}
