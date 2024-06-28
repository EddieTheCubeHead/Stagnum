import { Search } from "../../search/views/Search.tsx"
import { useSearchStore } from "../stores/searchStore.ts"
import { ConfirmPoolOverwriteModal } from "../../pool/components/ConfirmPoolOverwriteModal.tsx"
import { usePoolStore } from "../stores/poolStore.ts"
import { Pool } from "../../pool/views/Pool.tsx"
import { ConfirmPoolDeleteModal } from "../../pool/components/ConfirmPoolDeleteModal.tsx"
import { AlertHandler } from "../../alertSystem/AlertHandler.tsx"
import { useStartWebSocket } from "../hooks/useStartWebSocket.ts"
import { useTokenStore } from "../stores/tokenStore.ts"
import { useEffect } from "react"

export const Home = () => {
    const { token } = useTokenStore()
    const { query } = useSearchStore()
    const { pool, deletingPool } = usePoolStore()
    const { confirmingOverwrite } = usePoolStore()
    const startWebSocket = useStartWebSocket()
    useEffect(() => {
        startWebSocket()
    }, [token])
    return (
        <>
            <AlertHandler />
            {confirmingOverwrite !== null && <ConfirmPoolOverwriteModal />}
            {deletingPool && <ConfirmPoolDeleteModal />}
            <div className="flex grow min-w-0">
                {pool && <Pool />}
                {query !== "" && <Search />}
            </div>
        </>
    )
}
