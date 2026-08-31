import { Icon, IconProps } from "./Icon.tsx"
import { Size } from "../constants/size.ts"
import clsx from "clsx"

interface IconButtonProps extends IconProps {
    onClick: () => void
    title?: string
    label?: string
}

export const IconButton = ({ svg, onClick, title, label, toggled, size, disabled }: IconButtonProps) => {
    const buttonClass = clsx("flex-col", "group", "grow-0", "shrink-0", "justify-center", "items-center", {
        "fill-clickable": !disabled,
        "hover:fill-stroke": !disabled,
        "fill-clickable-disabled": disabled,
        "size-12": size === Size.l,
        "size-8": size === Size.md || size === undefined,
        "pointer-events-none": disabled,
    })

    const titleClass = clsx("select-none", "font-bold", "text-icon", "text-center", {
        "text-accent": toggled && !disabled,
        "group-hover:text-accent-purple": toggled && !disabled,
        "text-clickable": !toggled && !disabled,
        "group-hover:text-stroke": !toggled && !disabled,
        "text-clickable-disabled": !toggled && disabled,
        "text-clickable-toggled-disabled": toggled && disabled,
    })

    return (
        <button aria-label={label ?? title} onClick={onClick} className={buttonClass} disabled={disabled}>
            <div className="flex justify-center items-center">
                <Icon svg={svg} button={true} toggled={toggled} size={size} disabled={disabled} />
            </div>

            {title && <p className={titleClass}>{title}</p>}
        </button>
    )
}
