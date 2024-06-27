import { ReactNode } from "react"
import { ToolBarHighlightedButton } from "./ToolBarHighlightedButton.tsx"
import { ToolBarState, useToolBarStore } from "../../stores/toolBarStore.ts"
import { CloseIconSvg } from "../../icons/svgs/CloseIconSvg.tsx"
import { IconButton } from "../../icons/IconButton.tsx"

interface ToolBarOpenedFieldProps {
    onClick: () => void
    svg: ReactNode
    action: ReactNode
}

export const ToolBarOpenedField = ({ onClick, action, svg }: ToolBarOpenedFieldProps) => {
    const { setState } = useToolBarStore()
    return (
        <div className="rounded-full border flex border-accent h-8 bg-elementBackground-3 placeholder-clickable text-stroke w-52 items-center z-20 pl-3 pr-1 focus:outline-none has-[:focus]:ring-1 has-[:focus]:ring-accent-purple peer shadow-xl shadow-background">
            {action}
            <ToolBarHighlightedButton svg={svg} onClick={onClick} />
            <IconButton onClick={() => setState(ToolBarState.Normal)} svg={<CloseIconSvg />} />
        </div>
    )
}
