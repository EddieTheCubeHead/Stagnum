import { describe, it, expect } from "vitest"
import { Home } from "../../../src/common/views/Home"
import { render, screen } from "@testing-library/react"
import { TestQueryProvider } from "../../utils/TestQueryProvider"
import { mockAxiosGet } from "../../utils/mockAxios"
import { mockedSearchData } from "../../search/data/mockedSearchData"
import { useSearchStore } from "../../../src/common/stores/searchStore"

describe("Home", () => {
    it("Should not render search if query is null", () => {
        render(
            <TestQueryProvider>
                <Home />
            </TestQueryProvider>,
        )

        expect(screen.queryByText("Tracks")).toBeNull()
    })
    it("Should render search if search query set", () => {
        mockAxiosGet(mockedSearchData())
        useSearchStore.setState({ query: "my query" })
        render(
            <TestQueryProvider>
                <Home />
            </TestQueryProvider>,
        )

        expect(screen.getByText("Tracks")).toBeDefined()
    })
})
