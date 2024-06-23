import { useSearchStore } from "../../common/stores/searchStore.ts"
import { SearchCategoryTitleCard } from "./cards/SearchCategoryTitleCard.tsx"
import { SearchSpotifyArtistCard } from "./cards/SearchSpotifyArtistCard.tsx"
import { Artist } from "../../common/icons/Artist.tsx"
import { useSpotifyGeneralQuery } from "../hooks/useSpotifyGeneralQuery.ts"

export const SearchArtists = () => {
    const { data } = useSpotifyGeneralQuery()
    const searchStore = useSearchStore()
    return (
        <div className="flex-col space-y-1 px-2">
            <SearchCategoryTitleCard
                title="Artists"
                icon={<Artist />}
                isOpen={searchStore.isArtistsOpened}
                setIsOpen={searchStore.setIsArtistsOpened}
            />
            {searchStore.isArtistsOpened ? (
                <div className="flex-col space-y-1 pl-8 pr-1">
                    {data?.artists.items.map((artist) => <SearchSpotifyArtistCard key={artist.uri} artist={artist} />)}
                </div>
            ) : (
                <div className="flex-col pl-8 pr-1 relative -top-1">
                    <div className="bg-elementBackground-1 h-1 -top-2 rounded-b-md"></div>
                </div>
            )}
        </div>
    )
}
