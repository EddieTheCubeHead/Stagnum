import { createRootRouteWithContext, useNavigate } from "@tanstack/react-router"
import { QueryClient } from "@tanstack/react-query"
import { TopBar } from "../common/components/TopBar.tsx"
import { ToolBar } from "../toolbar/components/ToolBar.tsx"
import { z } from "zod"
import { Home } from "../common/views/Home.tsx"
import { ModalSchema } from "../common/modals/modalTypes.ts"
import { useTokenStore } from "../common/stores/tokenStore.ts"

const rootSearchSchema = z.object({
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
    const { token } = useTokenStore()
    const navigate = useNavigate()
    console.log({ token })

    if (!token) {
        void navigate({ to: "/login" })
    }

    return (
        <div className="bg-background text-text min-h-screen font-default">
            <TopBar />
            <Home />
            <ToolBar />
        </div>
    )
}
