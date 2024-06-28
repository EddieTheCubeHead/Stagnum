import { ReactNode } from "react"
import { Size } from "../constants/size.ts"

export interface IconProps {
    svg: ReactNode
    button?: boolean
    toggled?: boolean
    size?: Size.md | Size.l
}

export const Icon = ({ svg, button, toggled, size }: IconProps) => {
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
        <span className={`${size === Size.l ? "size-10" : "size-6"} flex items-center justify-center`}>
            <span className={`${size === Size.l ? "size-7" : "size-5"} ${colorClassName}`}>{svg}</span>
        </span>
    )
}
