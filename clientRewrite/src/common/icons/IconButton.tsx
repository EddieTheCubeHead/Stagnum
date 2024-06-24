import { ReactNode } from "react"
import { Icon } from "./Icon.tsx"

interface IconButtonProps {
    svg: ReactNode
    onClick: () => void
}

export const IconButton = ({ svg, onClick }: IconButtonProps) => {
    return (
        <button onClick={onClick} className="hover:fill-stroke fill-clickable size-6">
            <Icon svg={svg} />
        </button>
    )
}
