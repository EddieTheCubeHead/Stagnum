import { ReactNode } from "react"
import { Size } from "../constants/size.ts"
import clsx from "clsx"

export interface IconProps {
    svg: ReactNode
    button?: boolean
    toggled?: boolean
    disabled?: boolean
    size?: Size.md | Size.l
}

export const Icon = ({ svg, button, toggled, size, disabled }: IconProps) => {
    const iconClass = clsx({
        "size-7": size === Size.l,
        "size-5": size === Size.md || size === undefined,
        "fill-clickable": !toggled && !disabled,
        "stroke-clickable": !toggled && !disabled,
        "fill-accent": toggled && !disabled,
        "stroke-accent": toggled && !disabled,
        "fill-clickable-toggled-disabled": toggled && disabled,
        "stroke-clickable-toggled-disabled": toggled && disabled,
        "fill-clickable-disabled": !toggled && disabled,
        "stroke-clickable-disabled": !toggled && disabled,
        "group-hover:fill-stroke": button && !toggled && !disabled,
        "group-hover:stroke-stroke": button && !toggled && !disabled,
        "group-hover:fill-accent-purple": button && toggled && !disabled,
        "group-hover:stroke-accent-purple": button && toggled && !disabled,
    })

    const iconFrameClass = clsx("flex", "items-center", "justify-center", {
        "size-10": size === Size.l,
        "size-6": size === Size.md || size === undefined,
    })

    return (
        <span className={iconFrameClass}>
            <span className={iconClass}>{svg}</span>
        </span>
    )
}
