import { SearchCategoryTitleCard } from "./cards/SearchCategoryTitleCard.tsx"
import { SearchSpotifyArtistCard } from "./cards/SearchSpotifyArtistCard.tsx"
import { ArtistIconSvg } from "../../common/icons/svgs/ArtistIconSvg.tsx"
import { SpotifyArtist } from "../models/SpotifyArtist.ts"
import { GeneralSpotifySearchResult } from "../models/GeneralSpotifySearchResult.ts"

interface SearchArtistsProps {
    artists: GeneralSpotifySearchResult["artists"]
    isOpen: boolean
    toggleOpen: () => void
}

export const SearchArtists = ({ artists, isOpen, toggleOpen }: SearchArtistsProps) => {
    return (
        <div className="flex-col px-2">
            <SearchCategoryTitleCard
                title="Artists"
                iconSvg={<ArtistIconSvg />}
                isOpen={isOpen}
                setIsOpen={toggleOpen}
            />
            {isOpen ? (
                <div className="flex-col space-y-1 pl-10 pr-1 pt-1">
                    {artists.items.map((artist: SpotifyArtist) => (
                        <SearchSpotifyArtistCard key={artist.uri} artist={artist} />
                    ))}
                </div>
            ) : (
                <div className="flex-col pl-10 pr-1">
                    <div className="bg-elementBackground-1 h-1 -top-2 rounded-b-md"></div>
                </div>
            )}
        </div>
    )
}
