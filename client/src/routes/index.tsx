import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/")({
    component: MainView,
})

function MainView() {
    return <></>
}
