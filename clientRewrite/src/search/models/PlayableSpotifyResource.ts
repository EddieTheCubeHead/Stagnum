import { NamedSpotifyResource } from "../../common/models/NamedSpotifyResource.ts"

export interface PlayableSpotifyResource extends NamedSpotifyResource {
    uri: string
}
