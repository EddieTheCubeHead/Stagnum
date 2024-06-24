import { Search } from "../../search/views/Search.tsx"
import { useSearchStore } from "../stores/searchStore.ts"

export const Home = () => {
    const searchStore = useSearchStore()
    return <>{searchStore.query !== "" && <Search />}</>
}
