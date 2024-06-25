import { ReactNode } from "react"

interface SubviewTopBarProps {
    children?: ReactNode
}

export const SubviewTopBar = ({ children }: SubviewTopBarProps) => {
    return (
        <div className="bg-elementBackground-2 w-full rounded-b-md z-20 sticky flex top-0 h-cardHeight items-center justify-center shadow-background shadow-md select-none">
            {children}
        </div>
    )
}
