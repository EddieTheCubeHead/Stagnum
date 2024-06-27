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
            <Icon svg={<SharePoolIconSvg />} size={Size.l} />
            <ToolBarHighlightedButton svg={<SearchIconSvg />} onClick={() => setState(ToolBarState.Search)} />
            <Icon svg={<JoinPoolIconSvg />} size={Size.l} />
            {pool ? (
                <IconButton svg={<DeletePoolIconSvg />} size={Size.l} onClick={() => setDeletingPool(true)} />
            ) : (
                <Icon svg={<DeletePoolIconSvg />} size={Size.l} />
            )}
        </>
    )
}
