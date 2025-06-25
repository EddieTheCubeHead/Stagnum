import { NamedSpotifyResource } from "../../common/models/NamedSpotifyResource.ts"
import { PlayableSpotifyResourceWithIcon } from "./PlayableSpotifyResourceWithIcon.ts"

export interface SpotifyAlbum extends PlayableSpotifyResourceWithIcon {
    artists: NamedSpotifyResource[]
    year: number
}
