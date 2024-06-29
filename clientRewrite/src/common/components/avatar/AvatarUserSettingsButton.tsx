import { Avatar } from "./Avatar.tsx"
import { useState } from "react"
import { UserSettingsMenu } from "./UserSettingsMenu.tsx"

export const AvatarUserSettingsButton = () => {
    const [isOpened, setIsOpened] = useState<boolean>(false)
    return (
        <div>
            <button onClick={() => setIsOpened(!isOpened)} className="hover:scale-105">
                <Avatar />
            </button>
            {isOpened && <UserSettingsMenu />}
        </div>
    )
}
