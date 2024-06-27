import { HomeIconSvg } from "../../icons/svgs/HomeIconSvg.tsx"
import { Size } from "../../constants/size.ts"
import { IconButton } from "../../icons/IconButton.tsx"
import { useSearchStore } from "../../stores/searchStore.ts"
import { ToolBarState, useToolBarStore } from "../../stores/toolBarStore.ts"
import { ToolBarButtons } from "./ToolBarButtons.tsx"
import { ToolBarExpandedSearch } from "./ToolBarExpandedSearch.tsx"

export const ToolBar = () => {
    const { clearQuery } = useSearchStore()
    const { state, setState } = useToolBarStore()
    const clearToolbarState = () => {
        clearQuery()
        setState(ToolBarState.Normal)
    }
    return (
        <div className="select-none w-full justify-center items-center p-8 fixed bottom-4 flex z-30 pointer-events-none">
            <div className="flex items-center pointer-events-auto rounded-full space-x-3 px-3 bg-elementBackground-1/85 sm:bg-elementBackground-1/65 md:bg-elementBackground-1/45 lg:bg-elementBackground-1/25">
                <IconButton svg={<HomeIconSvg />} size={Size.l} onClick={clearToolbarState} />
                {state === ToolBarState.Normal && <ToolBarButtons />}
                {state === ToolBarState.Search && <ToolBarExpandedSearch />}
            </div>
        </div>
    )
}
