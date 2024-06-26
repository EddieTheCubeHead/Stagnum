import { ReactNode } from "react"

interface IconPrompts {
    svg: ReactNode
    button?: boolean
    toggled?: boolean
}

export const Icon = ({ svg, button, toggled }: IconPrompts) => {
    let colorClassName = "fill-clickable stroke-clickable"
    if (toggled) {
        colorClassName = "fill-accent stroke-accent"
    }

    if (button) {
        colorClassName += toggled
            ? " group-hover:fill-accent-purple group-hover:stroke-accent-purple"
            : " group-hover:fill-stroke group-hover:stroke-stroke"
    }
    return (
        <span className="size-8 flex items-center justify-center">
            <span className={`size-5 ${colorClassName}`}>{svg}</span>
        </span>
    )
}
