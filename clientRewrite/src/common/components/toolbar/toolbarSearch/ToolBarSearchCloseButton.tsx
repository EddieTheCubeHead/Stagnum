import { CloseIconSvg } from "../../../icons/svgs/CloseIconSvg.tsx"
import { useSearchStore } from "../../../stores/searchStore.ts"

export const ToolBarSearchCloseButton = () => {
    const searchStore = useSearchStore()
    return (
        <div className="rounded-full border border-accent h-8 w-20 bg-elementBackground-3 flex items-center pl-12 group-focus/search-bar:ring-1 peer-focus:ring-accent-purple peer-focus:ring-1">
            <button
                onClick={() => {
                    searchStore.setIsOpened(false)
                    searchStore.clearQuery()
                }}
                className="h-cardHeight w-cardHeight z-30"
                aria-label="Close search"
            >
                <CloseIconSvg />
            </button>
        </div>
    )
}
