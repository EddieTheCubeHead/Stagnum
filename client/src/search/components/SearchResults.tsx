import { SearchTracks } from "./SearchTracks.tsx"
import { SearchAlbums } from "./SearchAlbums.tsx"
import { SearchArtists } from "./SearchArtists.tsx"
import { SearchPlaylists } from "./SearchPlaylists.tsx"
import { GeneralSpotifySearchResult } from "../models/GeneralSpotifySearchResult.ts"

interface SearchResultsProps {
    results: GeneralSpotifySearchResult
}

export const SearchResults = ({ results }: SearchResultsProps) => {
    return (
        <div className="space-y-1 pb-4">
            <SearchTracks tracks={results.tracks} />
            <SearchAlbums albums={results.albums} />
            <SearchArtists artists={results.artists} />
            <SearchPlaylists playlists={results.playlists} />
        </div>
    )
}
