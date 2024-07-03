import { PoolUser } from "./PoolUser.ts"
import { PoolTrack } from "./PoolTrack.ts"
import { User } from "./User.ts"

export interface Pool {
    users: PoolUser[]
    currently_playing: Omit<PoolTrack, "id">
    share_code?: string
    owner: User
    is_active: boolean
}
