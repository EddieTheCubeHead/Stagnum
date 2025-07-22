import { createRouter } from "@tanstack/react-router"
import { routeTree } from "./routeTree.gen.ts"
import { QueryClient } from "@tanstack/react-query"

// Export for testing whole app
export const createAppRouter = (queryClient: QueryClient, scrollRestoration: boolean = true) =>
    createRouter({
        routeTree,
        context: {
            queryClient,
        },
        defaultPreload: "intent",
        defaultPreloadStaleTime: 0,
        scrollRestoration,
    })
