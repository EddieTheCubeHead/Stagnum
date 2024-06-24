import { SearchIconSvg } from "../../../icons/svgs/SearchIconSvg.tsx"
import { useSearchStore } from "../../../stores/searchStore.ts"

export const ToolBarSearchOpenButton = () => {
    const searchStore = useSearchStore()
    return (
        <button
            className="rounded-full group size-bigCardHeight border-2 border-accent bg-elementBackground-1 shadow-md shadow-background flex justify-center items-center z-30"
            onClick={() => searchStore.setIsOpened(true)}
            aria-label="Search"
        >
            <span className="size-6 fill-clickable group-hover:fill-stroke">
                <SearchIconSvg />
            </span>
        </button>
    )
}
