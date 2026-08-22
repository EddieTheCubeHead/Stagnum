import { createFileRoute, useNavigate } from "@tanstack/react-router"
import { z } from "zod"
import { useTokenQuery } from "../common/hooks/useTokenQuery.ts"
import { useEffect } from "react"
import { tokenHolder } from "../api/tokenHolder.ts"

const redirectSchema = z.object({
    code: z.string(),
    state: z.string(),
})

export const Route = createFileRoute("/loginRedirect")({
    component: LoginRedirect,
    validateSearch: redirectSchema,
})

function LoginRedirect() {
    const { code, state } = Route.useSearch()
    const navigate = useNavigate()
    const { token } = useTokenQuery({ code, state })
    useEffect(() => {
        if (token !== undefined) {
            tokenHolder.setToken(token)
            void navigate({ to: "/" })
        }
    }, [token])
    return <></>
}
