import { HomeIconSvg } from "../../icons/svgs/HomeIconSvg.tsx"
import { Size } from "../../constants/size.ts"
import { IconButton } from "../../icons/IconButton.tsx"
import { useSearchStore } from "../../stores/searchStore.ts"
import { ToolBarState, useToolBarStore } from "../../stores/toolBarStore.ts"
import { ToolBarButtons } from "./ToolBarButtons.tsx"
import { ToolBarExpandedSearch } from "./ToolBarExpandedSearch.tsx"
import { ToolBarExpandedSharePoolField } from "./ToolBarExpandedSharePoolField.tsx"
import { ToolBarExpandedJoinPoolField } from "./ToolBarExpandedJoinPoolField.tsx"
import { PlaybackDisplay } from "../PlaybackDisplay.tsx"
import { usePoolStore } from "../../stores/poolStore.ts"

export const ToolBar = () => {
    const { clearQuery } = useSearchStore()
    const { state, setState } = useToolBarStore()
    const { pool } = usePoolStore()
    const clearToolbarState = () => {
        clearQuery()
        setState(ToolBarState.Normal)
    }
    return (
        <div className="select-none w-full justify-center items-center p-8 fixed bottom-0 flex z-30 pointer-events-none">
            <div className="flex-col space-y-4 min-w-72 max-w-80 grow">
                <div className="flex items-center pointer-events-auto rounded-full px-3 bg-elementBackground-1/90 sm:bg-elementBackground-1/75 md:bg-elementBackground-1/60 lg:bg-elementBackground-1/45">
                    <div className="basis-1/5 grow-0 shrink-0">
                        <IconButton svg={<HomeIconSvg />} size={Size.l} onClick={clearToolbarState} />
                    </div>
                    {state === ToolBarState.Normal && <ToolBarButtons />}
                    {state === ToolBarState.Search && <ToolBarExpandedSearch />}
                    {state === ToolBarState.SharePool && <ToolBarExpandedSharePoolField />}
                    {state === ToolBarState.JoinPool && <ToolBarExpandedJoinPoolField />}
                </div>
                {pool?.currently_playing && <PlaybackDisplay />}
            </div>
        </div>
    )
}
