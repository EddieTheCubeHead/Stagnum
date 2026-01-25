import { createRouter } from "@tanstack/react-router"
import { routeTree } from "./routeTree.gen.ts"
import { QueryClient } from "@tanstack/react-query"

// Export for testing whole app
export const createAppRouter = (
    queryClient: QueryClient,
    scrollRestoration: boolean = true,
    defaultPendingMinMs: number | undefined = undefined,
) =>
    createRouter({
        routeTree,
        context: {
            queryClient,
        },
        defaultPendingMinMs,
        defaultPreload: "intent",
        defaultPreloadStaleTime: 0,
        scrollRestoration,
    })
