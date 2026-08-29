import { usePoolStore } from "../stores/poolStore.ts"
import { Pool } from "../../pool/views/Pool.tsx"
import { AlertHandler } from "../../alertSystem/AlertHandler.tsx"
import { useStartWebSocket } from "../hooks/useStartWebSocket.ts"
import { useEffect } from "react"
import { Outlet } from "@tanstack/react-router"
import { ModalRenderer } from "../modals/ModalRenderer.tsx"
import { useToken } from "../../api/tokenHolder.ts"
import { getPoolOptions } from "../../api/queryOptions.ts"
import { useQuery } from "@tanstack/react-query"

export const Home = () => {
    const token = useToken()
    const { pool, setPool, setPlaybackState, clearPool } = usePoolStore()
    useQuery(getPoolOptions(token))
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
