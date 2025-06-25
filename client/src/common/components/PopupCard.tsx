import { ReactNode } from "react"
import { BackgroundBlur } from "./BackgroundBlur.tsx"
import { Size } from "../constants/size.ts"

interface PopupCardProps {
    size: Size.l | Size.s
    children?: ReactNode
}

export const PopupCard = ({ size, children }: PopupCardProps) => {
    const largeClassName = "rounded-3xl w-64 md:w-128 lg:w-192 md:h-96 lg:h-128 py-8"
    const smallClassName = "rounded-3xl w-64 py-4"
    return (
        <BackgroundBlur>
            <div
                className={`${size === Size.l ? largeClassName : smallClassName} bg-elementBackground-1 border-accent border-2 drop-shadow-2xl flex items-center justify-center select-none`}
            >
                {children}
            </div>
        </BackgroundBlur>
    )
}
