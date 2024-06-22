import { ToolBarSearchInput } from "./ToolBarSearchInput.tsx"
import { ToolBarSearchOpenButton } from "./ToolBarSearchOpenButton.tsx"
import { ToolBarSearchCloseButton } from "./ToolBarSearchCloseButton.tsx"
import { useSearchStore } from "../../../stores/searchStore.ts"

export const ToolBarSearch = () => {
    const searchStore = useSearchStore()
    return (
        <div className="flex items-center">
            <div className="flex items-center -space-x-11 p-4">
                {searchStore.isOpened && <ToolBarSearchInput />}
                <ToolBarSearchOpenButton />
                {searchStore.isOpened && <ToolBarSearchCloseButton />}
            </div>
        </div>
    )
}
