import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from "vitest"
import { testApp } from "../utils/testComponent.tsx"
import { screen } from "@testing-library/react"
import { PoolState, usePoolStore } from "../../src/common/stores/poolStore.ts"
import { mockLoginState } from "../utils/mockLoginState.ts"
import { server } from "./server.ts"
import { UserEvent } from "@testing-library/user-event/dist/cjs/setup/setup.js"
import { get } from "./handlers.ts"
import { mockSearchData } from "./data/search.ts"

describe("Search acceptance tests", () => {
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

    const search = async (user: UserEvent, text: string) => {
        await user.click(screen.getByRole("button", { name: "Search" }))
        await user.type(screen.getByPlaceholderText("Search..."), text)
    }

    it("Should not render search if query is null", async () => {
        const { user } = await testApp()

        await user.click(screen.getByRole("button", { name: "Search" }))
        expect(screen.queryByRole("heading", { name: "Tracks" })).not.toBeInTheDocument()
    })

    it("Should render search if search query set", async () => {
        const { user } = await testApp()

        await search(user, "My search query")
        expect(await screen.findByRole("heading", { name: "Tracks" })).toBeVisible()
    })

    it("Should keep rendering search if query set and then cleared completely", async () => {
        const { user } = await testApp()

        await search(user, "My search query")
        expect(await screen.findByRole("heading", { name: "Tracks" })).toBeVisible()
        await user.clear(screen.getByPlaceholderText("Search..."))
        expect(await screen.findByRole("heading", { name: "Tracks" })).toBeVisible()
    })

    describe("SearchTopBar", () => {
        const getCardOpenedStates = () => {
            return {
                isTracksOpened: screen.queryByRole("button", { name: "Collapse tracks" }) !== null,
                isAlbumsOpened: screen.queryByRole("button", { name: "Collapse albums" }) !== null,
                isArtistsOpened: screen.queryByRole("button", { name: "Collapse artists" }) !== null,
                isPlaylistsOpened: screen.queryByRole("button", { name: "Collapse playlists" }) !== null,
            }
        }
        describe.each(["Track", "Album", "Artist", "Playlist"])("%s", (resourceType) => {
            it("Should render search result categories if query exists", async () => {
                const { user } = await testApp()

                await search(user, "My search query")

                expect(await screen.findByRole("heading", { name: `${resourceType}s` })).toBeVisible()
            })

            it("Should not render empty categories when data is loading", async () => {
                server.use(get("search", mockSearchData, "infinite"))
                const { user } = await testApp()
                await search(user, "My search query")

                expect(screen.queryByRole("heading", { name: `${resourceType}s` })).not.toBeInTheDocument()
            })

            it("Should render category buttons in top bar", async () => {
                const { user } = await testApp()
                await search(user, "My search query")

                expect(await screen.findByRole("button", { name: `${resourceType}s` })).toBeInTheDocument()
            })

            it("Should not render category buttons when data is loading", async () => {
                server.use(get("search", mockSearchData, "infinite"))
                const { user } = await testApp()
                await search(user, "My search query")

                expect(screen.queryByRole("button", { name: `${resourceType}s` })).not.toBeInTheDocument()
            })

            it(`Should set ${resourceType.toLowerCase()}s as the only open category on click ${resourceType.toLowerCase()}s button`, async () => {
                const { user } = await testApp()
                await search(user, "My search query")

                await user.click(await screen.findByRole("button", { name: `${resourceType}s` }))

                const searchState = getCardOpenedStates()

                for (const field in searchState) {
                    expect(searchState[field as keyof typeof searchState]).toBe(field === `is${resourceType}sOpened`)
                }
            })

            it(`Should set all categories as open on second click on ${resourceType.toLowerCase()}s button`, async () => {
                const { user } = await testApp()
                await search(user, "My search query")

                await user.click(await screen.findByRole("button", { name: `${resourceType}s` }))
                await user.click(screen.getByRole("button", { name: `${resourceType}s` }))

                const searchState = getCardOpenedStates()
                for (const field in searchState) {
                    expect(searchState[field as keyof typeof searchState]).toBe(true)
                }
            })
        })
    })
})
