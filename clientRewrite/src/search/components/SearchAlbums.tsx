import { SearchCategoryTitleCard } from "./cards/SearchCategoryTitleCard.tsx"
import { useSearchStore } from "../../common/stores/searchStore.ts"
import { SearchSpotifyAlbumCard } from "./cards/SearchSpotifyAlbumCard.tsx"
import { AlbumIconSvg } from "../../common/icons/svgs/AlbumIconSvg.tsx"
import { useSpotifyGeneralQuery } from "../hooks/useSpotifyGeneralQuery.ts"

export const SearchAlbums = () => {
    const { data } = useSpotifyGeneralQuery()
    const searchStore = useSearchStore()
    return (
        <div className="flex-col px-2">
            <SearchCategoryTitleCard
                title="Albums"
                iconSvg={<AlbumIconSvg />}
                isOpen={searchStore.isAlbumsOpened}
                setIsOpen={searchStore.setIsAlbumsOpened}
            />
            {searchStore.isAlbumsOpened ? (
                <div className="flex-col space-y-1 pl-10 pr-1 pt-1">
                    {data?.albums.items.map((album) => <SearchSpotifyAlbumCard key={album.uri} album={album} />)}
                </div>
            ) : (
                <div className="flex-col pl-10 pr-1">
                    <div className="bg-elementBackground-1 h-1 -top-2 rounded-b-md"></div>
                </div>
            )}
        </div>
    )
}
