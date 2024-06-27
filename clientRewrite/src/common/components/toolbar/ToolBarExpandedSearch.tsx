import { debounce } from "../../hooks/useDebounce.ts"
import { useSearchStore } from "../../stores/searchStore.ts"
import { ToolBarOpenedField } from "./ToolBarOpenedField.tsx"
import { SearchIconSvg } from "../../icons/svgs/SearchIconSvg.tsx"

export const ToolBarExpandedSearch = () => {
    const { setQuery } = useSearchStore()
    const debouncedSetQuery = debounce((query: string) => setQuery(query))
    return (
        <ToolBarOpenedField
            action={
                <input
                    type="text"
                    className="placeholder-clickable text-stroke !outline-0 !ring-0 !border-none bg-transparent min-w-0 grow"
                    placeholder="Search..."
                    onChange={(e) => debouncedSetQuery(e.target.value)}
                ></input>
            }
            onClick={() => {}}
            svg={<SearchIconSvg />}
        />
    )
}
