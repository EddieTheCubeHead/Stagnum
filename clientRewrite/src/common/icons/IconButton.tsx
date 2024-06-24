import { ReactNode } from "react"
import { Icon } from "./Icon.tsx"

interface IconButtonProps {
    svg: ReactNode
    onClick: () => void
    title?: string
    toggled?: boolean
}

export const IconButton = ({ svg, onClick, title, toggled }: IconButtonProps) => {
    return (
        <button
            onClick={onClick}
            className="fill-clickable hover:fill-stroke group size-8 flex-col -space-y-1 justify-center"
        >
            <Icon svg={svg} button={true} toggled={toggled} />
            {title && (
                <p
                    className={`select-none ${toggled ? "text-accent" : "text-clickable"} group-hover:text-stroke font-bold text-icon`}
                >
                    {title}
                </p>
            )}
        </button>
    )
}
