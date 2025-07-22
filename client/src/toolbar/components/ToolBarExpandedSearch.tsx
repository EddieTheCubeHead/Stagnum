import { debounce } from "../../common/hooks/useDebounce.ts"
import { ToolBarOpenedField } from "./ToolBarOpenedField.tsx"
import { SearchIconSvg } from "../../common/icons/svgs/SearchIconSvg.tsx"
import { useNavigate, useSearch } from "@tanstack/react-router"
import { useMemo } from "react"

interface ToolBarExpandedSearchProps {
    resetState: () => void
}

export const ToolBarExpandedSearch = ({ resetState }: ToolBarExpandedSearchProps) => {
    const navigate = useNavigate()
    const debouncedSetQuery = debounce((query: string) => {
        if (query === "") {
            return
        }
        void navigate({ to: `/search`, search: (prev) => ({ ...prev, query }) })
    })
    const { query } = useSearch({ strict: false })
    const defaultSearch = useMemo(() => query ?? "", [])
    return (
        <ToolBarOpenedField
            action={
                <input
                    type="text"
                    className="placeholder-clickable text-stroke text-xs !outline-0 !ring-0 !border-none bg-transparent min-w-0 grow"
                    placeholder="Search..."
                    defaultValue={defaultSearch}
                    onChange={(e) => debouncedSetQuery(e.target.value)}
                ></input>
            }
            onClick={() => {}}
            resetState={resetState}
            svg={<SearchIconSvg />}
        />
    )
}
