import { describe, it, expect, beforeEach, vi, afterEach } from "vitest"
import { act, screen, waitFor } from "@testing-library/react"
import { ToolBar } from "../../../src/common/components/toolbar/ToolBar"
import { useSearchStore } from "../../../src/common/stores/searchStore"
import { usePoolStore } from "../../../src/common/stores/poolStore"
import { mockedCollectionPoolData, mockedTrackPoolData } from "../../search/data/mockPoolData"
import { ToolBarState, useToolBarStore } from "../../../src/common/stores/toolBarStore"
import { mockAxiosGet, mockAxiosPost } from "../../utils/mockAxios"
import axios from "axios"
import { TestQueryProvider } from "../../utils/TestQueryProvider"
import testComponent from "../../utils/testComponent.tsx"
import { useTokenStore } from "../../../src/common/stores/tokenStore.ts"
import { mockedSearchData } from "../../search/data/mockedSearchData.ts"

describe("Tool bar", () => {
    beforeEach(() => {
        useToolBarStore.setState({ state: ToolBarState.Normal })
    })

    describe("Search", () => {
        it("Should render toolbarSearch button initially", () => {
            testComponent(
                <TestQueryProvider>
                    <ToolBar />
                </TestQueryProvider>,
            )
            expect(screen.getByRole("button", { name: "Search" })).toBeDefined()
        })

        it("Should not initially render toolbarSearch field and close toolbarSearch buttons", () => {
            testComponent(
                <TestQueryProvider>
                    <ToolBar />
                </TestQueryProvider>,
            )
            expect(screen.queryByRole("button", { name: "Close search" })).toBeNull()
            expect(screen.queryByPlaceholderText("Search...")).toBeNull()
        })

        it("Should render toolbarSearch field and close toolbarSearch buttons after click on open toolbarSearch button", async () => {
            const { user } = testComponent(
                <TestQueryProvider>
                    <ToolBar />
                </TestQueryProvider>,
            )
            await user.click(screen.getByRole("button", { name: "Search" }))

            expect(screen.getByRole("button", { name: "Close" })).toBeDefined()
            expect(screen.getByPlaceholderText("Search...")).toBeDefined()
        })

        it("Should not set search query immediately after typing", async () => {
            const { user } = testComponent(
                <TestQueryProvider>
                    <ToolBar />
                </TestQueryProvider>,
            )
            await user.click(screen.getByRole("button", { name: "Search" }))
            await user.type(screen.getByRole("textbox"), "test query")

            expect(useSearchStore.getState().query).toBe("")
        })

        describe("Debounce", () => {
            const debounceDelay = 511

            afterEach(() => {
                vi.restoreAllMocks()
            })

            it("Should set search query with debounce delay after typing", async () => {
                const { user } = testComponent(
                    <TestQueryProvider>
                        <ToolBar />
                    </TestQueryProvider>,
                )
                await user.click(screen.getByRole("button", { name: "Search" }))
                await user.type(screen.getByRole("textbox"), "test")
                await user.type(screen.getByRole("textbox"), " query")

                expect(useSearchStore.getState().query).toBe("")

                vi.useFakeTimers()
                await act(() => vi.advanceTimersByTime(debounceDelay + 1))
                vi.useRealTimers()

                await waitFor(() => expect(useSearchStore.getState().query).toBe("test query"))
            })

            it("Should not change search query if search input changes to empty string", async () => {
                useSearchStore.setState({ query: "test" })
                const { user } = testComponent(
                    <TestQueryProvider>
                        <ToolBar />
                    </TestQueryProvider>,
                )
                await user.click(screen.getByRole("button", { name: "Search" }))
                await user.type(screen.getByRole("textbox"), "test")
                await user.clear(screen.getByRole("textbox"))

                vi.useFakeTimers()
                await act(() => vi.advanceTimersByTime(debounceDelay + 1))
                vi.useRealTimers()

                await waitFor(() => expect(useSearchStore.getState().query).toBe("test"))
            })
        })

        it("Should close search field when pressing close", async () => {
            useSearchStore.setState({ query: "test" })
            const { user } = testComponent(
                <TestQueryProvider>
                    <ToolBar />
                </TestQueryProvider>,
            )
            await user.click(screen.getByRole("button", { name: "Search" }))
            await user.click(screen.getByRole("button", { name: "Close" }))

            expect(useSearchStore.getState().isOpened).toBe(false)
        })

        it("Should clear search query when pressing home", async () => {
            useSearchStore.setState({ query: "test" })
            const { user } = testComponent(
                <TestQueryProvider>
                    <ToolBar />
                </TestQueryProvider>,
            )
            await user.click(screen.getByRole("button", { name: "Home" }))

            expect(useSearchStore.getState().query).toBe("")
        })
    })

    describe("Delete", () => {
        it("Should render delete pool as disabled if user has no pool", () => {
            testComponent(
                <TestQueryProvider>
                    <ToolBar />
                </TestQueryProvider>,
            )
            expect(screen.queryByRole("button", { name: "Delete pool" })).toBeNull()
            expect(screen.getByTitle("Delete pool")).toBeDefined()
        })

        it("Should not render delete pool at all if search field is opened", () => {
            useToolBarStore.setState({ state: ToolBarState.Search })
            testComponent(
                <TestQueryProvider>
                    <ToolBar />
                </TestQueryProvider>,
            )
            expect(screen.queryByTitle("Delete pool")).toBeNull()
        })

        it("Should render delete pool as button if user has a pool", async () => {
            useTokenStore.setState({ token: "my token" })
            usePoolStore.setState({ pool: mockedTrackPoolData() })
            mockAxiosGet(mockedTrackPoolData().owner)
            testComponent(
                <TestQueryProvider>
                    <ToolBar />
                </TestQueryProvider>,
            )

            expect(await screen.findByRole("button", { name: "Delete pool" })).toBeDefined()
        })

        it("Should display leave pool instead of delete pool if user is part of another user's pool", () => {
            mockAxiosGet({ display_name: "Test", icon_url: null, spotify_id: "1234" })
            const mockPool = mockedCollectionPoolData()
            usePoolStore.setState({ pool: mockPool })

            testComponent(
                <TestQueryProvider>
                    <ToolBar />
                </TestQueryProvider>,
            )

            expect(screen.getByRole("button", { name: "Leave pool" })).toBeDefined()
        })
    })

    describe("Share", () => {
        it("Should render share pool share field after clicking on share pool", async () => {
            const mockPool = mockedTrackPoolData()
            usePoolStore.setState({ pool: mockPool })
            mockPool.share_code = "123456"
            mockAxiosPost(mockPool)
            const { user } = testComponent(
                <TestQueryProvider>
                    <ToolBar />
                </TestQueryProvider>,
            )

            await user.click(screen.getByRole("button", { name: "Share pool" }))

            expect(screen.getByText("123456")).toBeDefined()
        })

        it("Should render share pool skeleton after clicking on share pool if pool is loading", async () => {
            const mockPool = mockedTrackPoolData()
            usePoolStore.setState({ pool: { ...mockPool } })
            mockPool.share_code = "123456"

            vi.spyOn(axios, "post").mockImplementation(async (_url, _config) => {
                await new Promise((resolve) => setTimeout(resolve, 500))
                return mockedSearchData()
            })

            const { user } = testComponent(
                <TestQueryProvider>
                    <ToolBar />
                </TestQueryProvider>,
            )

            await user.click(screen.getByRole("button", { name: "Share pool" }))

            expect(screen.queryByText("123456")).toBeNull()
        })
    })

    describe("Join", () => {
        it("Should render code input after clicking join pool", async () => {
            const { user } = testComponent(
                <TestQueryProvider>
                    <ToolBar />
                </TestQueryProvider>,
            )
            await user.click(screen.getByRole("button", { name: "Join pool" }))

            expect(screen.getByPlaceholderText("Pool code")).toBeDefined()
        })

        it("Should join pool after filling pool code and clicking join pool", async () => {
            const mockPool = mockedTrackPoolData()
            usePoolStore.setState({ pool: mockPool })
            mockPool.share_code = "123456"
            mockAxiosPost(mockPool)
            const { user } = testComponent(
                <TestQueryProvider>
                    <ToolBar />
                </TestQueryProvider>,
            )
            await user.click(screen.getByRole("button", { name: "Join pool" }))
            await user.type(screen.getByPlaceholderText("Pool code"), "123456")
            await user.click(screen.getByRole("button", { name: "Join pool" }))

            expect(usePoolStore.getState().pool?.share_code).toBe("123456")
        })
    })

    describe("Playback", () => {
        it("Should display playback state if pool exists", () => {
            const mockPool = mockedTrackPoolData()
            usePoolStore.setState({ pool: mockPool })
            testComponent(
                <TestQueryProvider>
                    <ToolBar />
                </TestQueryProvider>,
            )
            expect(
                screen.getByRole("img", { name: `Currently playing ${mockPool.currently_playing.name} icon` }),
            ).toBeDefined()
            expect(screen.getByText(mockPool.currently_playing.name)).toBeDefined()
        })

        it("Should pause playback on clicking pause on playback display", async () => {
            const mockPool = mockedTrackPoolData()
            usePoolStore.setState({ pool: mockPool })
            mockAxiosPost({ ...mockPool, is_active: false })
            const { user } = testComponent(
                <TestQueryProvider>
                    <ToolBar />
                </TestQueryProvider>,
            )
            await user.click(screen.getByRole("button", { name: "Pause" }))
            expect(screen.getByRole("button", { name: "Play" })).toBeDefined()
        })
    })
})
