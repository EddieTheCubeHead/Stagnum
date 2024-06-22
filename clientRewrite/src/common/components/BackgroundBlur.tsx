import { ReactNode } from "react"

interface BackgroundBlurProps {
    children?: ReactNode
}

export const BackgroundBlur = ({ children }: BackgroundBlurProps) => {
    return (
        <div className="h-screen w-screen backdrop-blur-sm z-40 top-0 absolute flex items-center justify-center">
            {children}
        </div>
    )
}
