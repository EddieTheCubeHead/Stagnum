import { PlayableSpotifyResource } from "./PlayableSpotifyResource.ts"
import { NamedSpotifyResource } from "../../common/models/NamedSpotifyResource.ts"

export interface SpotifyAlbum extends PlayableSpotifyResource {
    artists: NamedSpotifyResource[]
    year: number
    icon_link: string
}
