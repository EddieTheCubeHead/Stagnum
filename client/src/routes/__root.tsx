import { createRootRouteWithContext, useNavigate } from "@tanstack/react-router"
import { QueryClient, useQueryClient } from "@tanstack/react-query"
import { TopBar } from "../common/components/TopBar.tsx"
import { ToolBar } from "../toolbar/components/ToolBar.tsx"
import { useEffect } from "react"
import { useTokenQuery } from "../common/hooks/useTokenQuery.ts"
import { z } from "zod"
import { zodValidator } from "@tanstack/zod-adapter"
import { Home } from "../common/views/Home.tsx"
import { TOKEN } from "../common/constants/queryKey.ts"
import { LOCALSTORAGE_TOKEN_KEY } from "../common/constants/localStorage.ts"

const redirectSearchSchema = z.object({
    code: z.optional(z.string()),
    state: z.optional(z.string()),
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
    const client = useQueryClient()
    const navigate = useNavigate()

    useEffect(() => {
        if (isLoading || isFetching) {
            return
        }

        if (!code && !state && token === undefined) {
            void navigate({ to: "/login" })
        }

        if (code && state && token !== undefined) {
            localStorage.setItem(LOCALSTORAGE_TOKEN_KEY, token)
            client.invalidateQueries({ queryKey: [TOKEN] }).then(() => void navigate({ to: "/" }))
        }
    }, [token, code, state, isLoading, isFetching])

    return (
        <div className="bg-background text-text min-h-screen font-default">
            <TopBar />
            <Home />
            <ToolBar />
        </div>
    )
}
