import { PopupCard } from "../../../common/components/PopupCard.tsx"
import { LoginPopupPrompt } from "./LoginPopupPrompt.tsx"
import { LoginPopupBackgroundImage } from "./LoginPopupBackgroundImage.tsx"
import { Size } from "../../../common/constants/size.ts"

export const LoginPopup = () => {
    return (
        <PopupCard size={Size.l}>
            <LoginPopupPrompt />
            <LoginPopupBackgroundImage />
        </PopupCard>
    )
}
