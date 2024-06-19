import { useQuery } from "@tanstack/react-query"
import { fetchMe } from "../api/fetchMe.ts"
import { useTokenStore } from "../common/stores/tokenStore.ts"
import { useUserStore } from "../common/stores/userStore.ts"
import { useEffect } from "react"

export const Home = () => {
    const tokenStore = useTokenStore()
    const token = tokenStore.token
    const userStore = useUserStore()

    const { isPending, isError, data } = useQuery({ queryKey: ["me", { token }], queryFn: fetchMe })
    useEffect(() => {
        userStore.setUser(data)
    }, [isPending])

    if (isError) {
        tokenStore.setToken(null)
    }
    return <div>Home</div>
}
