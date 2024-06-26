import { PoolUser } from "./PoolUser.ts"
import { PoolTrack } from "./PoolTrack.ts"
import { User } from "./User.ts"

export interface Pool {
    users: PoolUser[]
    currently_playing: PoolTrack
    share_code?: string
    owner: User
}
