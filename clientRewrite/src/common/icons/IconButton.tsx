import { ReactNode } from "react"
import { Icon } from "./Icon.tsx"
import { Size } from "../constants/size.ts"

interface IconButtonProps {
    svg: ReactNode
    onClick: () => void
    title?: string
    toggled?: boolean
    size?: Size.md | Size.l
}

export const IconButton = ({ svg, onClick, title, toggled, size }: IconButtonProps) => {
    return (
        <button
            onClick={onClick}
            className={`fill-clickable hover:fill-stroke group ${size === Size.l ? "size-12" : "size-8"} flex-col -space-y-1 justify-center`}
        >
            <Icon svg={svg} button={true} toggled={toggled} size={size} />
            {title && (
                <p
                    className={`select-none ${toggled ? "text-accent group-hover:text-accent-purple" : "text-clickable group-hover:text-stroke"} font-bold text-icon`}
                >
                    {title}
                </p>
            )}
        </button>
    )
}
