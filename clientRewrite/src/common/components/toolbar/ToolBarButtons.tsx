import { Icon } from "../../icons/Icon.tsx"
import { SharePoolIconSvg } from "../../icons/svgs/SharePoolIconSvg.tsx"
import { Size } from "../../constants/size.ts"
import { JoinPoolIconSvg } from "../../icons/svgs/JoinPoolIconSvg.tsx"
import { IconButton } from "../../icons/IconButton.tsx"
import { DeletePoolIconSvg } from "../../icons/svgs/DeletePoolIconSvg.tsx"
import { usePoolStore } from "../../stores/poolStore.ts"
import { ToolBarHighlightedButton } from "./ToolBarHighlightedButton.tsx"
import { SearchIconSvg } from "../../icons/svgs/SearchIconSvg.tsx"
import { ToolBarState, useToolBarStore } from "../../stores/toolBarStore.ts"

export const ToolBarButtons = () => {
    const { pool, setDeletingPool } = usePoolStore()
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
            <div className="grow">
                {pool ? (
                    <IconButton svg={<DeletePoolIconSvg />} size={Size.l} onClick={() => setDeletingPool(true)} />
                ) : (
                    <div className="size-12 flex items-center justify-center">
                        <Icon svg={<DeletePoolIconSvg />} size={Size.l} />
                    </div>
                )}
            </div>
        </>
    )
}
