import { useSearchStore } from "../../common/stores/searchStore.ts"
import { SearchCategoryTitleCard } from "./cards/SearchCategoryTitleCard.tsx"
import { SearchSpotifyArtistCard } from "./cards/SearchSpotifyArtistCard.tsx"
import { ArtistIconSvg } from "../../common/icons/svgs/ArtistIconSvg.tsx"
import { useSpotifyGeneralQuery } from "../hooks/useSpotifyGeneralQuery.ts"
import { SpotifyArtist } from "../models/SpotifyArtist.ts"

export const SearchArtists = () => {
    const { data } = useSpotifyGeneralQuery()
    const searchStore = useSearchStore()
    return (
        <div className="flex-col px-2">
            <SearchCategoryTitleCard
                title="Artists"
                iconSvg={<ArtistIconSvg />}
                isOpen={searchStore.isArtistsOpened}
                setIsOpen={searchStore.setIsArtistsOpened}
            />
            {searchStore.isArtistsOpened ? (
                <div className="flex-col space-y-1 pl-10 pr-1 pt-1">
                    {data?.artists.items.map((artist: SpotifyArtist) => (
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
