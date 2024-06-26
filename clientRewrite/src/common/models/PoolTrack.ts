import { PoolMember } from "./PoolMember.ts"

export interface PoolTrack extends PoolMember {
    spotify_track_uri: string
    duration_ms: number
}
