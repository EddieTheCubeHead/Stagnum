import { SharePoolIconSvg } from "../../icons/svgs/SharePoolIconSvg.tsx"
import { Size } from "../../constants/size.ts"
import { JoinPoolIconSvg } from "../../icons/svgs/JoinPoolIconSvg.tsx"
import { IconButton } from "../../icons/IconButton.tsx"
import { ToolBarHighlightedButton } from "./ToolBarHighlightedButton.tsx"
import { SearchIconSvg } from "../../icons/svgs/SearchIconSvg.tsx"
import { ToolBarState, useToolBarStore } from "../../stores/toolBarStore.ts"
import { ToolBarClearPoolButton } from "./ToolBarClearPoolButton.tsx"

export const ToolBarButtons = () => {
    const { setState } = useToolBarStore()
    return (
        <>
            <div className="grow">
                <IconButton svg={<SharePoolIconSvg />} size={Size.l} onClick={() => setState(ToolBarState.SharePool)} />
            </div>
            <div className="grow">
                <ToolBarHighlightedButton svg={<SearchIconSvg />} onClick={() => setState(ToolBarState.Search)} />
            </div>
            <div className="grow">
                <IconButton svg={<JoinPoolIconSvg />} size={Size.l} onClick={() => setState(ToolBarState.JoinPool)} />
            </div>
            <ToolBarClearPoolButton />
        </>
    )
}
