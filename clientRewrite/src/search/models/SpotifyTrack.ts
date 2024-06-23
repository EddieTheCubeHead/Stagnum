import { PlayableSpotifyResource } from "./PlayableSpotifyResource.ts"
import { NamedSpotifyResource } from "../../common/models/NamedSpotifyResource.ts"
import { SpotifyAlbum } from "./SpotifyAlbum.ts"

export interface SpotifyTrack extends PlayableSpotifyResource {
    artists: NamedSpotifyResource[]
    album: SpotifyAlbum
    duration_ms: number
}
