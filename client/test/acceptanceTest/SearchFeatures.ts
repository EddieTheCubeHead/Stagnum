import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from "vitest"
import { testApp } from "../utils/testComponent.tsx"
import { screen } from "@testing-library/react"
import { PoolState, usePoolStore } from "../../src/common/stores/poolStore.ts"
import { mockLoginState } from "../utils/mockLoginState.ts"
import { server } from "./server.ts"

describe("Search acceptance tests", () => {
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
        mockLoginState()
    })

    it("Should not render search if query is null", async () => {
        const { user } = await testApp()

        await user.click(screen.getByRole("button", { name: "Search" }))
        expect(screen.queryByRole("heading", { name: "Tracks" })).toBeNull()
    })

    it("Should render search if search query set", async () => {
        const { user } = await testApp()

        await user.click(screen.getByRole("button", { name: "Search" }))
        await user.type(screen.getByPlaceholderText("Search..."), "My search query")
        expect(await screen.findByRole("heading", { name: "Tracks" }))
    })

    it("Should keep rendering search if query set and then cleared completely", async () => {
        const { user } = await testApp()

        await user.click(screen.getByRole("button", { name: "Search" }))
        await user.type(screen.getByPlaceholderText("Search..."), "My search query")
        expect(await screen.findByRole("heading", { name: "Tracks" }))
        await user.clear(screen.getByPlaceholderText("Search..."))
        expect(await screen.findByRole("heading", { name: "Tracks" }))
    })
})
