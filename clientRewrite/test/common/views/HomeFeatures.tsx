import { describe, it, expect, beforeEach } from "vitest"
import { Home } from "../../../src/common/views/Home"
import { render, screen } from "@testing-library/react"
import { TestQueryProvider } from "../../utils/TestQueryProvider"
import { mockAxiosGet, mockMultipleGets } from "../../utils/mockAxios"
import { mockedSearchData } from "../../search/data/mockedSearchData"
import { useSearchStore } from "../../../src/common/stores/searchStore"
import { usePoolStore } from "../../../src/common/stores/poolStore"
import { mockedCollectionPoolData } from "../../search/data/mockPoolData"

describe("Home", () => {
    beforeEach(() => usePoolStore.setState({ deletingPool: false, confirmingOverwrite: null }))
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

        expect(screen.findByRole("heading", { name: "Tracks" })).toBeDefined()
    })

    it("Should render confirm pool overwrite modal if overwrite attempted", () => {
        usePoolStore.setState({ confirmingOverwrite: { name: "name", uri: "uri", link: "link" } })
        render(
            <TestQueryProvider>
                <Home />
            </TestQueryProvider>,
        )

        expect(screen.getByRole("heading", { name: "Warning!" })).toBeDefined()
        expect(
            screen.queryByText(
                "Creating a new playback pool will overwrite your current one! Are you sure you want to continue?",
            ),
        ).toBeDefined()
        expect(screen.getByRole("button", { name: "Cancel" })).toBeDefined()
        expect(screen.getByRole("button", { name: "Continue" })).toBeDefined()
    })

    it("Should fetch existing pool from server on Home view render", () => {
        mockMultipleGets({
            routes: [
                {
                    route: "/pool",
                    data: mockedCollectionPoolData(),
                },
            ],
        })
        render(
            <TestQueryProvider>
                <Home />
            </TestQueryProvider>,
        )

        expect(screen.findByText(mockedCollectionPoolData().users[0].collections[0].name)).toBeDefined()
    })
})
