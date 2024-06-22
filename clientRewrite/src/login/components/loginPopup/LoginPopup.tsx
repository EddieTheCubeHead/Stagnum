import { PopupCard } from "../../../common/components/PopupCard.tsx"
import { LoginPopupPrompt } from "./LoginPopupPrompt.tsx"
import { LoginPopupBackgroundImage } from "./LoginPopupBackgroundImage.tsx"

export const LoginPopup = () => {
    return (
        <PopupCard>
            <LoginPopupPrompt />
            <LoginPopupBackgroundImage />
        </PopupCard>
    )
}
