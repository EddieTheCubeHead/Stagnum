import { usePoolStore } from "../stores/poolStore.ts"
import { User } from "../models/User.ts"

export const usePoolUsers = (): User[] | undefined => {
    const { pool } = usePoolStore()
    return pool?.users.map((user) => user.user)
}
