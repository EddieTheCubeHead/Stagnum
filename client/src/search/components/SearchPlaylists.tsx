import { SearchCategoryTitleCard } from "./cards/SearchCategoryTitleCard.tsx"
import { PlaylistIconSvg } from "../../common/icons/svgs/PlaylistIconSvg.tsx"
import { SearchSpotifyPlaylistCard } from "./cards/SearchSpotifyPlaylistCard.tsx"
import { SpotifyPlaylist } from "../models/SpotifyPlaylist.ts"
import { GeneralSpotifySearchResult } from "../models/GeneralSpotifySearchResult.ts"
import { useSearchStates } from "../hooks/useSearchStates.ts"

interface SearchPlaylistsProps {
    playlists: GeneralSpotifySearchResult["playlists"]
}

export const SearchPlaylists = ({ playlists }: SearchPlaylistsProps) => {
    const { isPlaylistsOpen: isOpen, toggleSingle } = useSearchStates()
    return (
        <div className="flex-col px-2">
            <SearchCategoryTitleCard
                title="Playlists"
                iconSvg={<PlaylistIconSvg />}
                isOpen={isOpen}
                setIsOpen={() => toggleSingle("playlists")}
            />
            {isOpen ? (
                <div className="flex-col space-y-1 pl-10 pr-1 pt-1">
                    {playlists.items.map((playlist: SpotifyPlaylist) => (
                        <SearchSpotifyPlaylistCard key={playlist.uri} playlist={playlist} />
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
