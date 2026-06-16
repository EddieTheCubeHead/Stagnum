import { ReactNode } from "react"
import { userEvent, Options } from "@testing-library/user-event"
import { act, render } from "@testing-library/react"

import { RouterProvider } from "@tanstack/react-router"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { createAppRouter } from "../../src/createAppRouter.ts"

export const testComponent = (component: ReactNode, userEventOptions?: Options) => {
    const user = userEvent.setup(userEventOptions)
    return {
        user,
        ...render(component),
    }
}

interface TestAppOptions {
    queryClient?: QueryClient
    userEventOptions?: Options
}

export const testApp = async ({ queryClient, userEventOptions }: TestAppOptions = {}) => {
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
