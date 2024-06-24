import { ReactNode } from "react"

interface CardBaseProps {
    children?: ReactNode
}

export const CardBase = ({ children }: CardBaseProps) => {
    return (
        <div className="bg-elementBackground-2 h-cardHeight w-full flex px-1 rounded-md space-x-2 select-none items-center">
            {children}
        </div>
    )
}
