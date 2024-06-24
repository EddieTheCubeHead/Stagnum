import { beforeEach, describe, expect, it } from "vitest"
import { useSearchStore } from "../../../src/common/stores/searchStore"
import { mockAxiosGet } from "../../utils/mockAxios"
import { mockedSearchData } from "../data/mockedSearchData"
import { TestQueryProvider } from "../../utils/TestQueryProvider"
import { render, screen } from "@testing-library/react"
import { Search } from "../../../src/search/views/Search"

describe("Search", () => {
    beforeEach(() => {
        mockAxiosGet(mockedSearchData())
    })
    it("Should render search result categories if query exists", () => {
        useSearchStore.setState({ query: "my query" })

        render(
            <TestQueryProvider>
                <Search />
            </TestQueryProvider>,
        )

        const categories = ["Tracks", "Albums", "Artists", "Playlists"]

        categories.map((category) => expect(screen.getByText(category)).toBeDefined())
    })
})
