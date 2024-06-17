import { TopBar } from "../common/components/TopBar.tsx"
import { LoginPopup } from "../login/components/loginPopup/LoginPopup.tsx"
import { useTokenStore } from "../common/stores/tokenStore.ts"

export const Home = () => {
    const token = useTokenStore().token
    return (
        <div className="bg-background text-text min-h-screen font-default">
            <TopBar userName="Eddie" />
            {token === null && <LoginPopup />}
        </div>
    )
}
