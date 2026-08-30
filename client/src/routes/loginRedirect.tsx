import { createFileRoute, useNavigate } from "@tanstack/react-router"
import { z } from "zod"
import { useEffect } from "react"
import { tokenHolder } from "../api/tokenHolder.ts"
import { useQuery } from "@tanstack/react-query"
import { tokenOptions } from "../api/queryOptions.ts"

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
    const { data } = useQuery(tokenOptions(code, state))
    useEffect(() => {
        if (data?.token !== undefined) {
            tokenHolder.setToken(data.token)
            void navigate({ to: "/" })
        }
    }, [data])
    return <></>
}
