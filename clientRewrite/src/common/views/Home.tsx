import { Search } from "../../search/views/Search.tsx"
import { useSearchStore } from "../stores/searchStore.ts"
import { ConfirmPoolOverwriteModal } from "../../search/components/ConfirmPoolOverwriteModal.tsx"
import { usePoolStore } from "../stores/poolStore.ts"
import { Pool } from "../../pool/views/Pool.tsx"

export const Home = () => {
    const { query } = useSearchStore()
    const { pool } = usePoolStore()
    const { confirmingOverwrite } = usePoolStore()
    return (
        <>
            {confirmingOverwrite !== "" && <ConfirmPoolOverwriteModal />}
            <div className="flex grow min-w-0">
                {pool && <Pool />}
                {query !== "" && <Search />}
            </div>
        </>
    )
}
