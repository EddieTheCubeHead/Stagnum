import { ReactNode } from "react"

interface IconPrompts {
    svg: ReactNode
}

export const Icon = ({ svg }: IconPrompts) => {
    return (
        <span className="size-8 flex items-center justify-center">
            <span className="size-6 fill-clickable">{svg}</span>
        </span>
    )
}
