import { usePoolUsers } from "./usePoolUsers.ts"
import { User } from "../models/User.ts"

export const usePoolPromotedSongs = () => {
    const poolUsers = usePoolUsers()
    const poolPromotedSongs: Map<number, User> = new Map()
    poolUsers?.forEach((user) => {
        if (user.promoted_track_id) {
            poolPromotedSongs.set(user.promoted_track_id, user)
        }
    })
    return poolPromotedSongs
}
