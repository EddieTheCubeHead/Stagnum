import { SearchTopBar } from "../components/SearchTopBar.tsx"
import { SearchResults } from "../components/SearchResults.tsx"

export const Search = () => {
    return (
        <div className="max-h-full w-full flex-col space-y-2">
            <SearchTopBar />
            <SearchResults />
        </div>
    )
}
