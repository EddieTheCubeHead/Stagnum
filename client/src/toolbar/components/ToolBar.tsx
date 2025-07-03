import { HomeIconSvg } from "../../common/icons/svgs/HomeIconSvg.tsx"
import { Size } from "../../common/constants/size.ts"
import { IconButton } from "../../common/icons/IconButton.tsx"
import { ToolBarButtons } from "./ToolBarButtons.tsx"
import { ToolBarExpandedSearch } from "./ToolBarExpandedSearch.tsx"
import { ToolBarExpandedSharePoolField } from "./ToolBarExpandedSharePoolField.tsx"
import { ToolBarExpandedJoinPoolField } from "./ToolBarExpandedJoinPoolField.tsx"
import { PlaybackDisplay } from "../../common/components/playbackDisplay/PlaybackDisplay.tsx"
import { usePoolStore } from "../../common/stores/poolStore.ts"
import { useLocation, useNavigate } from "@tanstack/react-router"
import { useToolbarState } from "../hooks/useToolbarState.ts"

export const ToolBar = () => {
    const { pool } = usePoolStore()
    const { pathname } = useLocation()
    const { state } = useToolbarState()
    const navigate = useNavigate()
    console.log(pathname)
    return (
        <div className="select-none w-full justify-center items-center p-8 fixed bottom-0 flex z-30 pointer-events-none">
            <div className="flex-col space-y-4 min-w-72 max-w-80 grow">
                <div className="flex items-center pointer-events-auto rounded-full px-3 bg-elementBackground-1/90 sm:bg-elementBackground-1/75 md:bg-elementBackground-1/60 lg:bg-elementBackground-1/45">
                    <div className="flex basis-1/5 items-center grow-0 shrink-0 justify-center">
                        <IconButton svg={<HomeIconSvg />} size={Size.l} onClick={() => navigate({ to: "/" })} />
                    </div>
                    {state === undefined && <ToolBarButtons />}
                    {state === "search" && <ToolBarExpandedSearch />}
                    {state === "share" && <ToolBarExpandedSharePoolField />}
                    {state === "join" && <ToolBarExpandedJoinPoolField />}
                </div>
                {pool?.currently_playing && <PlaybackDisplay />}
            </div>
        </div>
    )
}
