import { LogoWithSpotifyLogo } from "../../../common/components/logo/LogoWithSpotifyLogo.tsx"
import { LoginPopupInfoText } from "./LoginPopupInfoText.tsx"
import { LoginPopupButton } from "./LoginPopupButton.tsx"

export const LoginPopupPrompt = () => {
    return (
        <div className="w-full flex-col space-y-2 md:space-y-4 lg:space-y-5">
            <LogoWithSpotifyLogo />
            <LoginPopupInfoText />
            <LoginPopupButton />
        </div>
    )
}
