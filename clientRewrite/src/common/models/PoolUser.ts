import { PoolTrack } from "./PoolTrack.ts"
import { PoolCollection } from "./PoolCollection.ts"
import { User } from "./User.ts"

export interface PoolUser {
    tracks: PoolTrack[]
    collections: PoolCollection[]
    user: User
}
