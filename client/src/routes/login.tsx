import { createFileRoute } from "@tanstack/react-router"
import { LoginPopup } from "../login/components/loginPopup/LoginPopup.tsx"

export const Route = createFileRoute("/login")({
    component: LoginPopup,
})
