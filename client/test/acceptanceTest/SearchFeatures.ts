import { beforeEach, describe, expect, it, vi } from "vitest"
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

    it.only("Should not render search if query is null", async () => {
        await testApp()

        expect(screen.queryByText("Tracks")).toBeNull()
        expect(screen.getByText("asgagadgasdgasdg"))
    })
})
