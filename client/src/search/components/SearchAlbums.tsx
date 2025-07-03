import { SearchCategoryTitleCard } from "./cards/SearchCategoryTitleCard.tsx"
import { SearchSpotifyAlbumCard } from "./cards/SearchSpotifyAlbumCard.tsx"
import { AlbumIconSvg } from "../../common/icons/svgs/AlbumIconSvg.tsx"
import { SpotifyAlbum } from "../models/SpotifyAlbum.ts"
import { GeneralSpotifySearchResult } from "../models/GeneralSpotifySearchResult.ts"
import { useSearchStates } from "../hooks/useSearchStates.ts"

interface SearchAlbumsProps {
    albums: GeneralSpotifySearchResult["albums"]
}

export const SearchAlbums = ({ albums }: SearchAlbumsProps) => {
    const { isAlbumsOpen: isOpen, toggleSingle } = useSearchStates()
    return (
        <div className="flex-col px-2">
            <SearchCategoryTitleCard
                title="Albums"
                iconSvg={<AlbumIconSvg />}
                isOpen={isOpen}
                setIsOpen={() => toggleSingle("albums")}
            />
            {isOpen ? (
                <div className="flex-col space-y-1 pl-10 pr-1 pt-1">
                    {albums.items.map((album: SpotifyAlbum) => (
                        <SearchSpotifyAlbumCard key={album.uri} album={album} />
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
