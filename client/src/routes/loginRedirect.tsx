import { createFileRoute, useNavigate } from "@tanstack/react-router"
import { z } from "zod"
import { useTokenQuery } from "../common/hooks/useTokenQuery.ts"
import { useTokenStore } from "../common/stores/tokenStore.ts"

const redirectSchema = z.object({
    code: z.string(),
    state: z.string(),
})

export const Route = createFileRoute("/loginRedirect")({
    component: LoginRedirect,
    validateSearch: redirectSchema,
})

function LoginRedirect() {
    const { setToken } = useTokenStore()
    const { code, state } = Route.useSearch()
    const navigate = useNavigate()
    const { token } = useTokenQuery({ code, state })
    if (token) {
        console.log("updating token: ", token)
        setToken(token)
        void navigate({ to: "/" })
    }
    return <></>
}
