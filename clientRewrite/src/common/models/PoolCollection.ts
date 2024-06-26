import { PoolMember } from "./PoolMember.ts"
import { PoolTrack } from "./PoolTrack.ts"

export interface PoolCollection extends PoolMember {
    spotify_resource_uri: string
    tracks: PoolTrack[]
}
