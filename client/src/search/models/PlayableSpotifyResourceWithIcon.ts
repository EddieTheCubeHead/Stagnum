import { PlayableSpotifyResource } from "./PlayableSpotifyResource.ts"

export interface PlayableSpotifyResourceWithIcon extends PlayableSpotifyResource {
    icon_link: string
}
