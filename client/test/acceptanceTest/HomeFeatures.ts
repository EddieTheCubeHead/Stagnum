import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from "vitest"
import { server } from "./server.ts"
import { testApp } from "../utils/testComponent.tsx"
import { screen } from "@testing-library/react"
import { mockLoginState } from "../utils/mockLoginState.ts"
import { PoolState, usePoolStore } from "../../src/common/stores/poolStore.ts"
import { mockMeData } from "./data/me.ts"
import { get } from "./handlers.ts"

describe("Home acceptance tests", () => {
    beforeAll(() => {
        server.listen()
    })

    afterEach(() => server.resetHandlers())

    afterAll(() => server.close())

    beforeEach(() => {
        vi.resetAllMocks()
        usePoolStore.setState({ poolState: PoolState.Normal, confirmingOverwrite: null })
        mockLoginState()
    })

    describe("Top bar", () => {
        it("Should render app name", async () => {
            await testApp()

            expect(screen.getByText("Stagnum")).toBeVisible()
        })

        it("Should render username first letter if image missing", async () => {
            const { icon_url: _, ...meDataNoImage } = mockMeData
            server.use(get("me", meDataNoImage))
            await testApp()

            expect(await screen.findByText(meDataNoImage.display_name.toUpperCase()[0])).toBeVisible()
        })

        it("Should render user icon if available", async () => {
            server.use(get("me", { display_name: "Avatar owner", icon_url: "img.example", spotify_id: "avatar" }))
            await testApp()

            expect(await screen.findByAltText("User Avatar owner avatar")).toBeVisible()
            expect(screen.queryByText(mockMeData.display_name.toUpperCase()[0])).not.toBeInTheDocument()
        })

        it("Should render user settings when clicking on top bar avatar", async () => {
            const { user } = await testApp()

            await user.click(screen.getByRole("button", { name: "User settings" }))

            expect(screen.getByRole("button", { name: "Log out" })).toBeVisible()
        })
    })
})
