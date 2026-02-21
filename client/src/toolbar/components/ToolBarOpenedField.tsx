import { ReactNode } from "react"
import { ToolBarHighlightedButton } from "./ToolBarHighlightedButton.tsx"
import { CloseIconSvg } from "../../common/icons/svgs/CloseIconSvg.tsx"
import { IconButton } from "../../common/icons/IconButton.tsx"

interface ToolBarOpenedFieldProps {
    onClick: () => void
    resetState: () => void
    svg: ReactNode
    action: ReactNode
}

export const ToolBarOpenedField = ({ onClick, action, resetState, svg }: ToolBarOpenedFieldProps) => {
    return (
        <div className="rounded-full border flex border-accent h-8 bg-elementBackground-3 placeholder-clickable text-stroke min-w-0 grow items-center z-20 pl-3 pr-1 has-[:focus]:ring-1 has-[:focus]:ring-accent-purple peer shadow-xl shadow-background">
            {action}
            <ToolBarHighlightedButton svg={svg} onClick={onClick} />
            <IconButton onClick={resetState} svg={<CloseIconSvg />} />
        </div>
    )
}
