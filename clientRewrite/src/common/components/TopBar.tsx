import { Logo } from "./logo/Logo.tsx"
import { Avatar } from "./avatar/Avatar.tsx"
import { Size } from "../constants/size.ts"

export function TopBar() {
    return (
        <div className="bg-elementBackground-1 select-none h-bigCardHeight w-full content-center p-2 drop-shadow-sm sticky top-0 flex z-30">
            <div className="absolute left-2">
                <Logo size={Size.md} />
            </div>
            <div className="absolute right-2">
                <Avatar />
            </div>
        </div>
    )
}
