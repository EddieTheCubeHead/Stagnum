import { ReactNode } from "react"

interface CardBaseProps {
    children?: ReactNode
    isParent?: boolean
}

export const CardBase = ({ children, isParent }: CardBaseProps) => {
    return (
        <div
            className={`bg-elementBackground-2 h-cardHeight w-full flex px-2 rounded-md space-x-2 select-none items-center ${isParent && "pr-3"}`}
        >
            {children}
        </div>
    )
}
