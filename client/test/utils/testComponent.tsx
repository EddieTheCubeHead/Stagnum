import { ReactNode } from "react"
import { userEvent, Options } from "@testing-library/user-event"
import { act, render } from "@testing-library/react"

import {
    createBrowserHistory,
    createRootRoute,
    createRoute,
    createRouter,
    RouterProvider,
} from "@tanstack/react-router"
import { TestQueryProvider } from "./TestQueryProvider.tsx"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { createAppRouter } from "../../src/createAppRouter.ts"

interface TestComponentConfigOptions {
    userEventOptions?: Options
    bonusRoutes?: string[]
}

export const testComponentWithRouter = async (
    component: ReactNode,
    { userEventOptions, bonusRoutes }: TestComponentConfigOptions = {},
) => {
    const history = createBrowserHistory()
    const rootRoute = createRootRoute()

    const rootComponent = () => {
        return <>{component}</>
    }

    const indexRoute = createRoute({
        getParentRoute: () => rootRoute,
        path: "/",
        component: rootComponent,
        notFoundComponent: rootComponent,
    })

    const routes = bonusRoutes
        ? [
              indexRoute.addChildren(
                  bonusRoutes.map((route) =>
                      createRoute({ path: route, component: rootComponent, getParentRoute: () => indexRoute }),
                  ),
              ),
          ]
        : [indexRoute]

    const router = createRouter({
        routeTree: rootRoute.addChildren(routes),
        history,
    })

    const client = new QueryClient()

    const user = userEvent.setup(userEventOptions)
    const renderResult = await act(async () =>
        render(
            <TestQueryProvider client={client}>
                <RouterProvider router={router} />
            </TestQueryProvider>,
        ),
    )

    // using then() instead of await here seems to eliminate the flakiness from resetting the shared global route
    // between tests
    await act(async () => router.navigate({ to: "/" })?.then())

    return {
        user,
        router,
        history,
        client,
        ...renderResult,
    }
}

export const testComponent = (component: ReactNode, userEventOptions?: Options) => {
    const user = userEvent.setup(userEventOptions)
    return {
        user,
        ...render(component),
    }
}

export const testApp = async (queryClient?: QueryClient, userEventOptions?: Options) => {
    const client = queryClient ?? new QueryClient()
    const router = createAppRouter(client, false)
    const user = userEvent.setup(userEventOptions)

    const renderResult = await act(async () =>
        render(
            <QueryClientProvider client={client}>
                <RouterProvider router={router} />
            </QueryClientProvider>,
        ),
    )

    // using then() instead of await here seems to eliminate the flakiness from resetting the shared global route
    // between tests
    await act(async () => router.navigate({ to: "/" })?.then())

    return {
        user,
        router,
        ...renderResult,
    }
}
