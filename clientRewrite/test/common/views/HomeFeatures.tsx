import { describe, it, expect, beforeEach } from "vitest"
import { Home } from "../../../src/common/views/Home"
import { act, render, screen } from "@testing-library/react"
import { TestQueryProvider } from "../../utils/TestQueryProvider"
import { mockAxiosGet } from "../../utils/mockAxios"
import { mockedSearchData } from "../../search/data/mockedSearchData"
import { useSearchStore } from "../../../src/common/stores/searchStore"
import { usePoolStore } from "../../../src/common/stores/poolStore"
import { mockedTrackPoolData } from "../../search/data/mockPoolData"
import { ToolBar } from "../../../src/common/components/toolbar/ToolBar"

describe("Home", () => {
    beforeEach(() => usePoolStore.setState({ deletingPool: false, confirmingOverwrite: "" }))
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
        expect(screen.getByRole("heading", { name: "Tracks" })).toBeDefined()
    })

    it("Should render confirm pool overwrite modal if overwrite attempted", () => {
        usePoolStore.setState({ confirmingOverwrite: "test_uri" })
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
})
