import { Search } from "../../../icons/Search.tsx"
import { useSearchStore } from "../../../stores/searchStore.ts"

export const ToolBarSearchOpenButton = () => {
    const searchStore = useSearchStore()
    return (
        <button
            className="rounded-full group h-bigCardHeight w-bigCardHeight border-2 border-accent bg-elementBackground-1 drop-shadow-2xl flex justify-center items-center z-30"
            onClick={() => searchStore.setIsOpened(true)}
            aria-label="Search"
        >
            <Search />
        </button>
    )
}
