import { useSearchStore } from "../../../stores/searchStore.ts"

export const ToolBarSearchInput = () => {
    const searchStore = useSearchStore()
    return (
        <input
            type="text"
            className="rounded-full border border-accent h-8 bg-elementBackground-3 placeholder-clickable text-stroke w-48 z-30 pl-4 pr-12 focus:outline-none focus:ring-1 focus:ring-accent-purple peer"
            placeholder="Search..."
            onChange={(e) => searchStore.setQuery(e.target.value)}
        ></input>
    )
}
