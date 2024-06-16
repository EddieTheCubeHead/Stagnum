import { TopBar } from "../common/components/TopBar.tsx"
import { LoginPopup } from "../login/components/loginPopup/LoginPopup.tsx"

export const Home = () => {
    return (
        <>
            <TopBar userName="Eddie" />
            <LoginPopup />
        </>
    )
}
