import { ReactNode } from "react"
import { BackgroundBlur } from "./BackgroundBlur.tsx"

interface PopupCardProps {
    children?: ReactNode
}

export const PopupCard = ({ children }: PopupCardProps) => {
    return (
        <BackgroundBlur>
            <div className="rounded-3xl w-64 md:w-128 lg:w-192 py-8 md:h-96 lg:h-128 bg-elementBackground-1 border-accent border-2 drop-shadow-2xl flex items-center justify-center select-none">
                {children}
            </div>
        </BackgroundBlur>
    )
}
