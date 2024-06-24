import { vi, describe, expect, it } from "vitest"
import { useSearchStore } from "../../../src/common/stores/searchStore"
import { mockAxiosGet } from "../../utils/mockAxios"
import { mockedSearchData } from "../data/mockedSearchData"
import { TestQueryProvider } from "../../utils/TestQueryProvider"
import { render, screen } from "@testing-library/react"
import { Search } from "../../../src/search/views/Search"
import axios from "axios"

describe("Search", () => {
    // @ts-expect-error
    it("Should render search result categories if query exists", async () => {
        mockAxiosGet(mockedSearchData())
        useSearchStore.setState({ query: "my query" })

        render(
            <TestQueryProvider>
                <Search />
            </TestQueryProvider>,
        )

        // @ts-expect-error
        await new Promise((r: TimerHandler) => setTimeout(r, 50))

        const categories = ["Tracks", "Albums", "Artists", "Playlists"]

        categories.map((category) => expect(screen.getByRole("heading", { name: category })).toBeDefined())
    })

    it("Should not render empty categories when data is loading", () => {
        vi.spyOn(axios, "get").mockImplementation(async (url, config) => {
            // @ts-expect-error
            await new Promise((resolve: TimerHandler) => setTimeout(resolve, 200))
            return mockedSearchData()
        })

        useSearchStore.setState({ query: "my query" })

        render(
            <TestQueryProvider>
                <Search />
            </TestQueryProvider>,
        )

        const categories = ["Tracks", "Albums", "Artists", "Playlists"]

        categories.map((category) => expect(screen.queryByRole("heading", { name: category })).toBeNull())
    })
})
