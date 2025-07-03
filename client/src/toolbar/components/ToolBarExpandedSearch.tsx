import { debounce } from "../../common/hooks/useDebounce.ts"
import { ToolBarOpenedField } from "./ToolBarOpenedField.tsx"
import { SearchIconSvg } from "../../common/icons/svgs/SearchIconSvg.tsx"
import { useNavigate } from "@tanstack/react-router"

export const ToolBarExpandedSearch = () => {
    const navigate = useNavigate()
    const debouncedSetQuery = debounce((query: string) => {
        console.log(query)
        void navigate({ to: `/search`, search: (prev) => ({ ...prev, query }) }).then()
    })
    return (
        <ToolBarOpenedField
            action={
                <input
                    type="text"
                    className="placeholder-clickable text-stroke text-xs !outline-0 !ring-0 !border-none bg-transparent min-w-0 grow"
                    placeholder="Search..."
                    onChange={(e) => debouncedSetQuery(e.target.value)}
                ></input>
            }
            onClick={() => {}}
            svg={<SearchIconSvg />}
        />
    )
}
