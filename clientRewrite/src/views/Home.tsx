import { useQuery } from "@tanstack/react-query"
import { fetchMe } from "../api/fetchMe.ts"
import { LoginPopup } from "../login/components/loginPopup/LoginPopup.tsx"
import { useTokenStore } from "../common/stores/tokenStore.ts"
import { useUserStore } from "../common/stores/userStore.ts"
import { useEffect } from "react"

export const Home = () => {
    const token = useTokenStore().token
    const userStore = useUserStore()
    const user = useQuery({ queryKey: ["me", { token }], queryFn: fetchMe })
    useEffect(() => {
        userStore.setUser(user.data?.data)
    }, [token])
    return token === null ? <LoginPopup /> : <div>Home</div>
}
