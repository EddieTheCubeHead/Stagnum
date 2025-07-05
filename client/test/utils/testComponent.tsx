import { ReactNode } from "react"
import { userEvent, Options } from "@testing-library/user-event"
import { render } from "@testing-library/react"

import {createBrowserHistory, createRootRoute, createRoute, createRouter, RouterProvider} from "@tanstack/react-router";
import {TestQueryProvider} from "./TestQueryProvider.tsx";
import {QueryClient} from "@tanstack/react-query";

export default function testComponent(component: ReactNode, userEventOptions?: Options) {

    const history = createBrowserHistory()
    const rootRoute = createRootRoute()

    const rootComponent = () => {
        return <>{component}</>
    }

    const indexRoute = createRoute({
        getParentRoute: () => rootRoute,
        path: '/',
        component: rootComponent,
    })

    const router = createRouter({
        routeTree: rootRoute.addChildren([indexRoute]),
        history,
    })

    const client = new QueryClient();

    const user = userEvent.setup(userEventOptions)
    return {
        user,
        router,
        history,
        client,
        ...render(
            <TestQueryProvider client={client}>
                <RouterProvider router={router}/>
            </TestQueryProvider>),
    }
}
