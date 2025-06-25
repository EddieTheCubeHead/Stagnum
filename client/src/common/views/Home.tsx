import { Search } from "../../search/views/Search.tsx"
import { useSearchStore } from "../stores/searchStore.ts"
import { ConfirmPoolOverwriteModal } from "../../pool/components/ConfirmPoolOverwriteModal.tsx"
import { PoolState, usePoolStore } from "../stores/poolStore.ts"
import { Pool } from "../../pool/views/Pool.tsx"
import { ConfirmPoolDeleteModal } from "../../pool/components/ConfirmPoolDeleteModal.tsx"
import { AlertHandler } from "../../alertSystem/AlertHandler.tsx"
import { useStartWebSocket } from "../hooks/useStartWebSocket.ts"
import { useTokenStore } from "../stores/tokenStore.ts"
import { useEffect } from "react"
import { useGetPoolQuery } from "../hooks/useGetPoolQuery.ts"
import { ConfirmPoolLeaveModal } from "../../pool/components/ConfirmPoolLeaveModal.tsx"

export const Home = () => {
    const { token } = useTokenStore()
    const { query } = useSearchStore()
    const { pool, poolState } = usePoolStore()
    const { confirmingOverwrite } = usePoolStore()
    useGetPoolQuery()
    const startWebSocket = useStartWebSocket()
    useEffect(() => {
        startWebSocket()
    }, [token])
    return (
        <>
            <AlertHandler />
            {confirmingOverwrite !== null && <ConfirmPoolOverwriteModal />}
            {poolState === PoolState.Deleting && <ConfirmPoolDeleteModal />}
            {poolState === PoolState.Leaving && <ConfirmPoolLeaveModal />}
            <div className="flex grow min-w-0">
                {pool && <Pool />}
                {query !== "" && <Search />}
            </div>
        </>
    )
}
