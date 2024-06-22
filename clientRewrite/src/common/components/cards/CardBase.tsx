import { ReactNode } from "react"

interface CardBaseProps {
    children?: ReactNode
}

export const CardBase = ({ children }: CardBaseProps) => {
    return <div className="bg-elementBackground-2 h-cardHeight w-full flex p-1 rounded-md space-x-1">{children}</div>
}
