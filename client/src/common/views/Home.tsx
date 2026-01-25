import { ConfirmPoolOverwriteModal } from "../../pool/components/ConfirmPoolOverwriteModal.tsx"
import { PoolState, usePoolStore } from "../stores/poolStore.ts"
import { Pool } from "../../pool/views/Pool.tsx"
import { ConfirmPoolDeleteModal } from "../../pool/components/ConfirmPoolDeleteModal.tsx"
import { AlertHandler } from "../../alertSystem/AlertHandler.tsx"
import { useStartWebSocket } from "../hooks/useStartWebSocket.ts"
import { useEffect } from "react"
import { useGetPoolQuery } from "../hooks/useGetPoolQuery.ts"
import { ConfirmPoolLeaveModal } from "../../pool/components/ConfirmPoolLeaveModal.tsx"
import { Outlet } from "@tanstack/react-router"
import { useTokenQuery } from "../hooks/useTokenQuery.ts"

export const Home = () => {
    const { token } = useTokenQuery()
    const { confirmingOverwrite, pool, poolState, setPool, setPlaybackState, clearPool } = usePoolStore()
    useGetPoolQuery()
    const startWebSocket = useStartWebSocket({ token, setPool, setPlaybackState, clearPool })
    useEffect(() => {
        startWebSocket()
    }, [startWebSocket])
    return (
        <>
            <AlertHandler />
            {confirmingOverwrite !== null && <ConfirmPoolOverwriteModal />}
            {poolState === PoolState.Deleting && <ConfirmPoolDeleteModal />}
            {poolState === PoolState.Leaving && <ConfirmPoolLeaveModal />}
            <div className="flex grow min-w-0">
                {pool && <Pool />}
                <Outlet />
            </div>
        </>
    )
}
