import { TopBar } from "../common/components/TopBar.tsx"
import { LoginPopup } from "../login/components/loginPopup/LoginPopup.tsx"

export const Home = () => {
    return (
        <div className="bg-background text-text min-h-screen font-default">
            <TopBar userName="Eddie" />
            <LoginPopup />
        </div>
    )
}
