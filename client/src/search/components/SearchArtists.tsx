import { SearchCategoryTitleCard } from "./cards/SearchCategoryTitleCard.tsx"
import { SearchSpotifyArtistCard } from "./cards/SearchSpotifyArtistCard.tsx"
import { ArtistIconSvg } from "../../common/icons/svgs/ArtistIconSvg.tsx"
import { SpotifyArtist } from "../models/SpotifyArtist.ts"
import { GeneralSpotifySearchResult } from "../models/GeneralSpotifySearchResult.ts"
import { useSearchStates } from "../hooks/useSearchStates.ts"

interface SearchArtistsProps {
    artists: GeneralSpotifySearchResult["artists"]
}

export const SearchArtists = ({ artists }: SearchArtistsProps) => {
    const { isArtistsOpen: isOpen, toggleSingle } = useSearchStates()
    return (
        <div className="flex-col px-2">
            <SearchCategoryTitleCard
                title="Artists"
                iconSvg={<ArtistIconSvg />}
                isOpen={isOpen}
                setIsOpen={() => toggleSingle("artists")}
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
