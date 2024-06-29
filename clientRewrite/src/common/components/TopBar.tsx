import { Logo } from "./logo/Logo.tsx"
import { Size } from "../constants/size.ts"
import { AvatarUserSettingsButton } from "./avatar/AvatarUserSettingsButton.tsx"

export function TopBar() {
    return (
        <header className="bg-elementBackground-1 select-none h-bigCardHeight w-full content-center sticky p-2 shadow-sm shadow-background top-0 flex z-30">
            <Logo size={Size.md} />
            <div className="grow"></div>
            <AvatarUserSettingsButton />
        </header>
    )
}
