import { Logo } from "./logo/Logo.tsx"
import { Avatar } from "./avatar/Avatar.tsx"
import { Size } from "../constants/size.ts"

export function TopBar() {
    return (
        <header className="bg-elementBackground-1 select-none h-bigCardHeight w-full content-center sticky p-2 drop-shadow-sm top-0 flex z-30">
            <div className="absolute left-2">
                <Logo size={Size.md} />
            </div>
            <div className="absolute right-2">
                <Avatar />
            </div>
        </header>
    )
}
