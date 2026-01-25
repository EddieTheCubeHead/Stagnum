import { describe, it, beforeAll, beforeEach, vi, afterEach, afterAll, expect } from "vitest"
import { testApp } from "../utils/testComponent.tsx"
import { server } from "./server.ts"
import { PoolState, usePoolStore } from "../../src/common/stores/poolStore.ts"
import { get } from "./handlers.ts"
import { act, screen } from "@testing-library/react"
import { mockMeData } from "./data/me.ts"

describe("Login acceptance tests", () => {
    beforeAll(() => {
        server.listen()
    })

    beforeEach(() => {
        vi.resetAllMocks()
    })

    afterEach(() => server.resetHandlers())

    afterAll(() => server.close())

    beforeEach(() => {
        usePoolStore.setState({ poolState: PoolState.Normal, confirmingOverwrite: null })
    })

    it("Should fetch login callback if code and state in url parameters", async () => {
        const { router } = await testApp()
        expect(screen.queryByLabelText(`User ${mockMeData.display_name} avatar`)).not.toBeInTheDocument()
        await act(async () => await router.navigate({ to: "/", search: { code: "123", state: "456" } }))
        expect(router.state.location.search).toEqual({})
        expect(await screen.findByLabelText(`User ${mockMeData.display_name} avatar`)).toBeVisible()
    })
})
