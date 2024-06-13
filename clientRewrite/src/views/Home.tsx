import { TopBar } from "../common/components/TopBar.tsx"
import { LoginPopup } from "../login/components/LoginPopup.tsx"

export const Home = () => {
    return (
        <>
            <TopBar userName="Eddie" />
            <LoginPopup />
        </>
    )
}
