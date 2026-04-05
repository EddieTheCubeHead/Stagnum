import { LOCALSTORAGE_TOKEN_KEY } from "../constants/localStorage.ts"
import { usePoolStore } from "../stores/poolStore.ts"
import { TOKEN } from "../constants/queryKey.ts"
import { useQueryClient } from "@tanstack/react-query"

interface UseLogOutProps {
    callback?: () => void
}

export const useLogOut = ({ callback }: UseLogOutProps = {}) => {
    const { clearPool } = usePoolStore()
    const client = useQueryClient()
    return async () => {
        localStorage.removeItem(LOCALSTORAGE_TOKEN_KEY)
        clearPool()
        await client.invalidateQueries({ queryKey: [TOKEN] })
        if (callback) {
            callback()
        }
    }
}
