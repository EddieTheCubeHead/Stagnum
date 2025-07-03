import { createRootRouteWithContext, Outlet, useNavigate } from "@tanstack/react-router"
import type { QueryClient } from "@tanstack/react-query"
import { TopBar } from "../common/components/TopBar.tsx"
import { ToolBar } from "../toolbar/components/ToolBar.tsx"
import { useEffect } from "react"
import { useTokenQuery } from "../common/hooks/useTokenQuery.ts"
import { z } from "zod"
import { zodValidator } from "@tanstack/zod-adapter"
import { Home } from "../common/views/Home.tsx"

const redirectSearchSchema = z.object({
    code: z.optional(z.string()),
    state: z.optional(z.string()),
    action: z.optional(z.enum(["search", "share", "join"])),
})

export const Route = createRootRouteWithContext<{
    queryClient: QueryClient
}>()({
    component: RootComponent,
    notFoundComponent: () => <div>Not found TODO</div>,
    validateSearch: zodValidator(redirectSearchSchema),
})

function RootComponent() {
    const { code, state } = Route.useSearch()
    const { token, isLoading, isFetching } = useTokenQuery({ code, state })
    const navigate = useNavigate()

    useEffect(() => {
        if (isLoading || isFetching) {
            return
        }

        if (!code && !state && token === undefined) {
            void navigate({ to: "/login" })
        }

        if (code && state && token !== undefined) {
            void navigate({ to: "/" })
        }
    }, [token, code, state])

    return (
        <div className="bg-background text-text min-h-screen font-default">
            <TopBar />
            <Home />
            <Outlet />
            <ToolBar />
        </div>
    )
}
