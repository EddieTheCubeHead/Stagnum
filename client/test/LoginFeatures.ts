import { describe, it, beforeAll, beforeEach, vi, afterEach, afterAll, expect } from "vitest"
import { testApp } from "./utils/testComponent.tsx"
import { server } from "./server.ts"
import { act, screen, waitFor } from "@testing-library/react"
import { mockMeData } from "./data/me.ts"
import { get } from "./handlers.ts"
import { Theme, useThemeStore } from "../src/common/stores/themeStore.ts"

describe("Login acceptance tests", () => {
    beforeAll(() => {
        server.listen({ onUnhandledRequest: "error" })
    })

    beforeEach(() => {
        vi.resetAllMocks()
    })

    afterEach(() => server.resetHandlers())

    afterAll(() => server.close())

    describe("Modal", () => {
        it("Should open login modal if token is not available", async () => {
            await testApp()

            expect(await screen.findByRole("button", { name: "Login" })).toBeVisible()
            expect(screen.getByText("Please log in with your Spotify account")).toBeVisible()
            expect(screen.getByAltText("Spotify logo")).toBeVisible()
        })

        it("Should display stagnum logo", async () => {
            await testApp()

            // Top bar and popup
            expect(screen.getAllByText("Stagnum").length).toEqual(2)
        })

        it("Should prompt the user to use Spotify for logging in", async () => {
            await testApp()

            expect(screen.getByText("Please log in with your Spotify account")).toBeVisible()
        })

        it.each([Theme.Dark, Theme.Light])(
            "Should render appropriate image if screen is wide enough, theme: %s",
            async (theme) => {
                useThemeStore.setState({ theme: theme })
                await testApp()

                expect(
                    screen.getByAltText(
                        `${theme.charAt(0).toUpperCase() + theme.slice(1)} theme login background image`,
                    ),
                ).toBeVisible()
            },
        )
    })

    it("Should fetch login callback if code and state in url parameters", async () => {
        server.use(get("me", { display_name: "Avatar owner", icon_url: "img.example", spotify_id: "avatar" }))
        const { router } = await testApp()
        expect(screen.queryByRole("button", { name: "User Avatar owner avatar" })).not.toBeInTheDocument()
        await act(async () => await router.navigate({ to: "/loginRedirect", search: { code: "123", state: "456" } }))
        await waitFor(() => expect(router.state.location.search).toEqual({}))
        expect(screen.getByRole("img", { name: `User ${mockMeData.display_name} avatar` })).toBeVisible()
        expect(screen.getByRole("button", { name: "User settings" })).toBeVisible()
    })

    it("Should log out after clicking log out", async () => {
        const { router, user } = await testApp()
        expect(screen.queryByRole("button", { name: `User ${mockMeData.display_name} avatar` })).not.toBeInTheDocument()
        await act(async () => await router.navigate({ to: "/", search: { code: "123", state: "456" } }))
        await user.click(screen.getByRole("button", { name: "User settings" }))
        await user.click(screen.getByRole("button", { name: "Log out" }))
        expect(await screen.findByRole("button", { name: "Login" })).toBeVisible()
    })
})
