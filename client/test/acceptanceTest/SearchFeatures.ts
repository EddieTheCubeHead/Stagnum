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

    beforeEach(() => {
        vi.resetAllMocks()
    })

    afterEach(() => server.resetHandlers())

    afterAll(() => server.close())

    beforeEach(() => {
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

    it("Should render search result categories if query exists", async () => {
        const { user } = await testApp()

        await search(user, "My search query")

        const categories = ["Tracks", "Albums", "Artists", "Playlists"]

        categories.map(async (category) => expect(await screen.findByRole("heading", { name: category })).toBeVisible())
    })

    it("Should not render empty categories when data is loading", async () => {
        server.use(get("search", mockSearchData, "infinite"))
        const { user } = await testApp()
        await search(user, "My search query")

        const categories = ["Tracks", "Albums", "Artists", "Playlists"]

        categories.map((category) => expect(screen.queryByRole("heading", { name: category })).not.toBeInTheDocument())
    })

    it("Should render category buttons in top bar", async () => {
        const { user } = await testApp()
        await search(user, "My search query")

        // It sees both the icon title and the icon button text
        const categories = ["Track Tracks", "Album Albums", "Artist Artists", "Playlist Playlists"]

        categories.map((category) => expect(screen.getByRole("button", { name: category })).toBeVisible())
    })

    it("Should not render category buttons when data is loading", async () => {
        server.use(get("search", mockSearchData, "infinite"))
        const { user } = await testApp()
        await search(user, "My search query")

        const categories = ["Track Tracks", "Album Albums", "Artist Artists", "Playlist Playlists"]

        categories.map((category) => expect(screen.queryByRole("button", { name: category })).not.toBeInTheDocument())
    })
})
