import { MainLogo } from "./MainLogo.tsx"
import { Avatar } from "./Avatar.tsx"

interface TopBarProps {
    imageUrl?: string
    userName: string
}

export function TopBar({ imageUrl, userName }: TopBarProps) {
    return (
        <div className="bg-elementBackground-1 h-bigCardHeight w-full content-center p-2 drop-shadow-sm sticky top-0 flex">
            <MainLogo />
            <Avatar imageUrl={imageUrl} userName={userName} />
        </div>
    )
}
