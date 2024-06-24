import { ReactNode } from "react"

interface IconPrompts {
    svg: ReactNode
    button?: boolean
    toggled?: boolean
}

export const Icon = ({ svg, button, toggled }: IconPrompts) => {
    return (
        <span className="size-8 flex items-center justify-center">
            <span
                className={`size-5 ${!!toggled ? "fill-accent stroke-accent" : "fill-clickable stroke-clickable"}  ${!!button && "group-hover:fill-stroke group-hover:stroke-stroke"}`}
            >
                {svg}
            </span>
        </span>
    )
}
