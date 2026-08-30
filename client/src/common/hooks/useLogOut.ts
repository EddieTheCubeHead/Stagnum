import { LOCALSTORAGE_TOKEN_KEY } from "../constants/localStorage.ts"
import { usePoolStore } from "../stores/poolStore.ts"
import { tokenHolder } from "../../api/tokenHolder.ts"

interface UseLogOutProps {
    callback?: () => void
}

export const useLogOut = ({ callback }: UseLogOutProps = {}) => {
    const { clearPool } = usePoolStore()
    return async () => {
        localStorage.removeItem(LOCALSTORAGE_TOKEN_KEY)
        clearPool()
        tokenHolder.setToken(null)
        if (callback) {
            callback()
        }
    }
}
