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

    // @ts-expect-error
    it("Should render search if search query set", async () => {
        mockAxiosGet(mockedSearchData())
        useSearchStore.setState({ query: "my query" })
        render(
            <TestQueryProvider>
                <Home />
            </TestQueryProvider>,
        )

        // @ts-expect-error
        await new Promise((resolve: TimerHandler) => setTimeout(resolve, 50))
        expect(screen.getByText("Tracks")).toBeDefined()
    })
})
