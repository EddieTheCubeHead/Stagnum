import { PaginatedSpotifySearchResult } from "./PaginatedSpotifySearchResult.ts"
import { SpotifyTrack } from "./SpotifyTrack.ts"
import { SpotifyAlbum } from "./SpotifyAlbum.ts"
import { SpotifyArtist } from "./SpotifyArtist.ts"
import { SpotifyPlaylist } from "./SpotifyPlaylist.ts"

export interface GeneralSpotifySearchResult {
    tracks: PaginatedSpotifySearchResult<SpotifyTrack>
    albums: PaginatedSpotifySearchResult<SpotifyAlbum>
    artists: PaginatedSpotifySearchResult<SpotifyArtist>
    playlists: PaginatedSpotifySearchResult<SpotifyPlaylist>
}
