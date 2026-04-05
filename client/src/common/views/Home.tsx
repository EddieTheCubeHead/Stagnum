import { usePoolStore } from "../stores/poolStore.ts"
import { Pool } from "../../pool/views/Pool.tsx"
import { AlertHandler } from "../../alertSystem/AlertHandler.tsx"
import { useStartWebSocket } from "../hooks/useStartWebSocket.ts"
import { useEffect } from "react"
import { useGetPoolQuery } from "../hooks/useGetPoolQuery.ts"
import { Outlet } from "@tanstack/react-router"
import { useTokenQuery } from "../hooks/useTokenQuery.ts"
import { ModalRenderer } from "../modals/ModalRenderer.tsx"

export const Home = () => {
    const { token } = useTokenQuery()
    const { pool, setPool, setPlaybackState, clearPool } = usePoolStore()
    useGetPoolQuery()
    const startWebSocket = useStartWebSocket({ token, setPool, setPlaybackState, clearPool })
    useEffect(() => {
        startWebSocket()
    }, [startWebSocket])
    return (
        <>
            <AlertHandler />
            <ModalRenderer />
            <div className="flex grow min-w-0">
                {pool && <Pool />}
                <Outlet />
            </div>
        </>
    )
}
