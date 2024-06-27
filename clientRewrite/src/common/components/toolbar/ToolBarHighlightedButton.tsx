import { IconButton } from "../../icons/IconButton.tsx"
import { Size } from "../../constants/size.ts"
import { ReactNode } from "react"

interface ToolBarHighlightedButtonProps {
    onClick: () => void
    svg: ReactNode
}

export const ToolBarHighlightedButton = ({ onClick, svg }: ToolBarHighlightedButtonProps) => {
    return (
        <div className="rounded-full group size-bigCardHeight border-2 border-accent bg-elementBackground-1 shadow-md shadow-background flex justify-center items-center z-30">
            <IconButton svg={svg} size={Size.l} onClick={onClick} />
        </div>
    )
}
