import { MainLogoWithSpotifyLogo } from "../../../common/components/MainLogoWithSpotifyLogo.tsx"
import { LoginPopupInfoText } from "./LoginPopupInfoText.tsx"
import { LoginPopupButton } from "./LoginPopupButton.tsx"

export const LoginPopupPrompt = () => {
    return (
        <div className="w-full flex-col space-y-2 md:space-y-4 lg:space-y-5">
            <MainLogoWithSpotifyLogo />
            <LoginPopupInfoText />
            <LoginPopupButton />
        </div>
    )
}
