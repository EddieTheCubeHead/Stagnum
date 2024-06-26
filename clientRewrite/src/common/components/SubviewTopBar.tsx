import { ReactNode } from "react"

interface SubviewTopBarProps {
    children?: ReactNode
}

export const SubviewTopBar = ({ children }: SubviewTopBarProps) => {
    return (
        <div className="bg-elementBackground-2 w-full rounded-b-md z-20 sticky flex top-0 h-cardHeight justify-center items-center shadow-background shadow-md select-none px-2 space-x-2">
            {children}
        </div>
    )
}
