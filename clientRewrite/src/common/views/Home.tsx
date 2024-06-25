import { Search } from "../../search/views/Search.tsx"
import { useSearchStore } from "../stores/searchStore.ts"
import { ConfirmPoolOverwriteModal } from "../../search/components/ConfirmPoolOverwriteModal.tsx"
import { usePoolStore } from "../stores/poolStore.ts"

export const Home = () => {
    const searchStore = useSearchStore()
    const { confirmingOverwrite } = usePoolStore()
    return (
        <>
            {confirmingOverwrite !== "" && <ConfirmPoolOverwriteModal />}
            {searchStore.query !== "" && <Search />}
        </>
    )
}
