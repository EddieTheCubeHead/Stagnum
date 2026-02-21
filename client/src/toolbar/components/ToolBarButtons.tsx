import { SharePoolIconSvg } from "../../common/icons/svgs/SharePoolIconSvg.tsx"
import { Size } from "../../common/constants/size.ts"
import { JoinPoolIconSvg } from "../../common/icons/svgs/JoinPoolIconSvg.tsx"
import { IconButton } from "../../common/icons/IconButton.tsx"
import { ToolBarHighlightedButton } from "./ToolBarHighlightedButton.tsx"
import { SearchIconSvg } from "../../common/icons/svgs/SearchIconSvg.tsx"
import { ToolBarClearPoolButton } from "./ToolBarClearPoolButton.tsx"
import { ToolBarState } from "../types/toolBarState.ts"

interface ToolBarButtonProps {
    setState: (state: ToolBarState) => void
}

export const ToolBarButtons = ({ setState }: ToolBarButtonProps) => {
    return (
        <div className="flex grow">
            <div className="flex basis-1/4 items-center justify-center">
                <IconButton svg={<SharePoolIconSvg />} size={Size.l} onClick={() => setState("share")} />
            </div>
            <div className="flex basis-1/4 items-center justify-center">
                <ToolBarHighlightedButton svg={<SearchIconSvg />} onClick={() => setState("search")} />
            </div>
            <div className="flex basis-1/4 items-center justify-center">
                <IconButton svg={<JoinPoolIconSvg />} size={Size.l} onClick={() => setState("join")} />
            </div>
            <div className="flex basis-1/4 items-center justify-center">
                <ToolBarClearPoolButton />
            </div>
        </div>
    )
}
