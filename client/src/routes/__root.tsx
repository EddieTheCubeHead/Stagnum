import { createRootRouteWithContext, useLocation, useNavigate } from "@tanstack/react-router"
import { QueryClient } from "@tanstack/react-query"
import { TopBar } from "../common/components/TopBar.tsx"
import { ToolBar } from "../toolbar/components/ToolBar.tsx"
import { useEffect } from "react"
import { useTokenQuery } from "../common/hooks/useTokenQuery.ts"
import { z } from "zod"
import { Home } from "../common/views/Home.tsx"
import { ModalSchema } from "../common/modals/modalTypes.ts"

export const rootSearchSchema = z.object({
    modal: ModalSchema.optional(),
})

export const Route = createRootRouteWithContext<{
    queryClient: QueryClient
}>()({
    component: RootComponent,
    notFoundComponent: NotFoundComponent,
    validateSearch: rootSearchSchema,
})

function NotFoundComponent() {
    return <div>Not found TODO</div>
}

function RootComponent() {
    const { token, isLoading, isFetching } = useTokenQuery()
    const location = useLocation()
    const navigate = useNavigate()

    useEffect(() => {
        if (isLoading || isFetching) {
            return
        }

        if (!token && !location.pathname.includes("login")) {
            void navigate({ to: "/login" })
        }
    }, [token, isLoading, isFetching, location])

    return (
        <div className="bg-background text-text min-h-screen font-default">
            <TopBar />
            <Home />
            <ToolBar />
        </div>
    )
}
