import { MeAvatar } from "./MeAvatar.tsx"
import { useState } from "react"
import { UserSettingsMenu } from "./UserSettingsMenu.tsx"

export const AvatarUserSettingsButton = () => {
    const [isOpened, setIsOpened] = useState<boolean>(false)
    return (
        <div>
            <button aria-label="User settings" onClick={() => setIsOpened(!isOpened)} className="hover:scale-105">
                <MeAvatar />
            </button>
            {isOpened && <UserSettingsMenu closeCallback={() => setIsOpened(false)} />}
        </div>
    )
}
