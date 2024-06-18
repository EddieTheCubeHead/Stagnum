import { MainLogo } from "./MainLogo.tsx"
import { Avatar } from "./avatar/Avatar.tsx"

export function TopBar() {
    return (
        <div className="bg-elementBackground-1 h-bigCardHeight w-full content-center p-2 drop-shadow-sm sticky top-0 flex z-30">
            <div className="absolute left-2">
                <MainLogo />
            </div>
            <div className="absolute right-2">
                <Avatar />
            </div>
        </div>
    )
}
