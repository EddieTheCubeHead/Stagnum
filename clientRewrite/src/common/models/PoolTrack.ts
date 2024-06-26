import { PoolMember } from "./PoolMember.ts"

export interface PoolTrack extends PoolMember {
    spotify_resource_uri: string
    duration_ms: number
}
