import { SearchTracks } from "./SearchTracks.tsx"
import { SearchAlbums } from "./SearchAlbums.tsx"
import { SearchArtists } from "./SearchArtists.tsx"
import { SearchPlaylists } from "./SearchPlaylists.tsx"
import { GeneralSpotifySearchResult } from "../models/GeneralSpotifySearchResult.ts"
import { toggledCategory } from "../hooks/useSearchStates.ts"

interface SearchResultsProps {
    results: GeneralSpotifySearchResult
    toggleCategory: (category: toggledCategory) => void
    tracks: boolean
    albums: boolean
    artists: boolean
    playlists: boolean
}

export const SearchResults = ({ results, toggleCategory, tracks, albums, artists, playlists }: SearchResultsProps) => {
    return (
        <div className="space-y-1 pb-4">
            <SearchTracks tracks={results.tracks} isOpen={tracks} toggleOpen={() => toggleCategory("tracks")} />
            <SearchAlbums albums={results.albums} isOpen={albums} toggleOpen={() => toggleCategory("albums")} />
            <SearchArtists artists={results.artists} isOpen={artists} toggleOpen={() => toggleCategory("artists")} />
            <SearchPlaylists
                playlists={results.playlists}
                isOpen={playlists}
                toggleOpen={() => toggleCategory("playlists")}
            />
        </div>
    )
}
