import { createRouteMask, createRouter } from "@tanstack/react-router"
import { routeTree } from "./routeTree.gen.ts"
import { QueryClient } from "@tanstack/react-query"

const rootRouteMask = createRouteMask({
    routeTree,
    from: "/",
    to: "/",
    search: () => ({}),
})

const searchRouteMask = createRouteMask({
    routeTree,
    from: "/search",
    search: ({ query }: { query: string }) => ({
        query,
    }),
})

const loginRedirectRouteMask = createRouteMask({
    routeTree,
    from: "/loginRedirect",
    to: "/",
    search: () => ({}),
})

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
        routeMasks: [rootRouteMask, searchRouteMask, loginRedirectRouteMask],
    })
