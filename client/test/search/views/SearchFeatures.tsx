import { vi, describe, expect, it } from "vitest"
import { useSearchStore } from "../../../src/common/stores/searchStore"
import { mockAxiosGet } from "../../utils/mockAxios"
import { mockedSearchData } from "../data/mockedSearchData"
import { TestQueryProvider } from "../../utils/TestQueryProvider"
import { act, screen } from "@testing-library/react"
import { Search } from "../../../src/search/views/Search"
import axios from "axios"
import { useTokenStore } from "../../../src/common/stores/tokenStore"
import testComponent from "../../utils/testComponent.tsx"

describe("Search", () => {
    it("Should render search result categories if query exists", async () => {
        mockAxiosGet(mockedSearchData())
        useSearchStore.setState({ query: "my query" })

        testComponent(
            <TestQueryProvider>
                <Search />
            </TestQueryProvider>,
        )

        const categories = ["Tracks", "Albums", "Artists", "Playlists"]

        categories.map(async (category) => expect(await screen.findByRole("heading", { name: category })).toBeDefined())
    })

    it("Should set new token if token changed", async () => {
        mockAxiosGet(mockedSearchData(), "test token")
        useSearchStore.setState({ query: "my query" })

        testComponent(
            <TestQueryProvider>
                <Search />
            </TestQueryProvider>,
        )

        await act(async () => await new Promise((r: TimerHandler) => setTimeout(r, 50)))

        expect(useTokenStore.getState().token).toBe("test token")
    })

    it("Should not render empty categories when data is loading", () => {
        vi.spyOn(axios, "get").mockImplementation(async (_url, _config) => {
            await new Promise((resolve: TimerHandler) => setTimeout(resolve, 200))
            return mockedSearchData()
        })

        useSearchStore.setState({ query: "my query" })

        testComponent(
            <TestQueryProvider>
                <Search />
            </TestQueryProvider>,
        )

        const categories = ["Tracks", "Albums", "Artists", "Playlists"]

        categories.map((category) => expect(screen.queryByRole("heading", { name: category })).toBeNull())
    })

    it("Should render category buttons in top bar", async () => {
        mockAxiosGet(mockedSearchData())
        useSearchStore.setState({ query: "my query" })

        testComponent(
            <TestQueryProvider>
                <Search />
            </TestQueryProvider>,
        )

        await act(async () => await new Promise((r: TimerHandler) => setTimeout(r, 50)))

        // It sees both the icon title and the icon button text
        const categories = ["Track Tracks", "Album Albums", "Artist Artists", "Playlist Playlists"]

        categories.map((category) => expect(screen.getByRole("button", { name: category })).toBeDefined())
    })

    it("Should not render category buttons when data is loading", () => {
        vi.spyOn(axios, "get").mockImplementation(async (_url, _config) => {
            await new Promise((resolve: TimerHandler) => setTimeout(resolve, 200))
            return mockedSearchData()
        })

        useSearchStore.setState({ query: "my query" })

        testComponent(
            <TestQueryProvider>
                <Search />
            </TestQueryProvider>,
        )

        const categories = ["Track Tracks", "Album Albums", "Artist Artists", "Playlist Playlists"]

        categories.map((category) => expect(screen.queryByRole("button", { name: category })).toBeNull())
    })
})
