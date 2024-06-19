import { useQuery } from "@tanstack/react-query"
import { fetchMe } from "../api/fetchMe.ts"
import { useTokenStore } from "../common/stores/tokenStore.ts"
import { useUserStore } from "../common/stores/userStore.ts"
import { useCallback, useEffect } from "react"

export const Home = () => {
    const token = useTokenStore().token
    const userStore = useUserStore()

    const user = useQuery({ queryKey: ["me", { token }], queryFn: fetchMe })
    const setUser = useCallback(() => {
        userStore.setUser(user.data?.data)
    }, [user])
    useEffect(() => {
        setUser()
    }, [token])
    return <div>Home</div>
}
