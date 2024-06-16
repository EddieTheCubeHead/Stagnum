import { MainLogoWithSpotifyLogo } from "../../../common/components/MainLogoWithSpotifyLogo.tsx"
import { LoginInfoText } from "./LoginInfoText.tsx"
import { LoginButton } from "./LoginButton.tsx"

export const LoginPopupPrompt = () => {
    return (
        <div className="w-full flex-col space-y-2 md:space-y-4 lg:space-y-5">
            <MainLogoWithSpotifyLogo />
            <LoginInfoText />
            <LoginButton />
        </div>
    )
}
