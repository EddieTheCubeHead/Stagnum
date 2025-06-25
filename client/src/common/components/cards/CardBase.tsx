import { ReactNode } from "react"

interface CardBaseProps {
    children?: ReactNode
    isTopLevel?: boolean
}

export const CardBase = ({ children, isTopLevel }: CardBaseProps) => {
    return (
        <div
            className={`bg-elementBackground-2 h-cardHeight w-full min-w-0 flex px-2 rounded-md space-x-2 select-none items-center ${isTopLevel && "pr-3"}`}
        >
            {children}
        </div>
    )
}
