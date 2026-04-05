import { createFileRoute, useNavigate } from "@tanstack/react-router"
import { z } from "zod"
import { useTokenQuery } from "../common/hooks/useTokenQuery.ts"
import { LOCALSTORAGE_TOKEN_KEY } from "../common/constants/localStorage.ts"
import { TOKEN } from "../common/constants/queryKey.ts"
import { useQueryClient } from "@tanstack/react-query"
import { useEffect } from "react"

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
    const client = useQueryClient()
    const { token } = useTokenQuery({ code, state })
    useEffect(() => {
        if (token !== undefined) {
            localStorage.setItem(LOCALSTORAGE_TOKEN_KEY, token)
            client.invalidateQueries({ queryKey: [TOKEN] }).then(() => void navigate({ to: "/" }))
        }
    }, [token])
    return <></>
}
