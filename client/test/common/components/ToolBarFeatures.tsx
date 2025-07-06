import { describe, it, expect, vi, afterEach } from "vitest"
import { act, screen, waitFor } from "@testing-library/react"
import { ToolBar } from "../../../src/toolbar/components/ToolBar.tsx"
import { usePoolStore } from "../../../src/common/stores/poolStore"
import { mockedCollectionPoolData, mockedTrackPoolData } from "../../search/data/mockPoolData"
import { mockAxiosGet, mockAxiosPost } from "../../utils/mockAxios"
import axios from "axios"
import testComponent from "../../utils/testComponent.tsx"
import { mockedSearchData } from "../../search/data/mockedSearchData.ts"
import { mockLoginState } from "../../utils/mockLoginState.ts"

describe("Tool bar", () => {

    describe("Search", () => {
        it("Should render toolbarSearch button initially", async () => {
            testComponent(<ToolBar />)
            expect(await screen.findByRole("button", { name: "Search" })).toBeDefined()
        })

        it("Should not initially render toolbarSearch field and close toolbarSearch buttons", () => {
            testComponent(<ToolBar />)
            expect(screen.queryByRole("button", { name: "Close search" })).toBeNull()
            expect(screen.queryByPlaceholderText("Search...")).toBeNull()
        })

        it("Should render toolbarSearch field and close toolbarSearch buttons after click on open toolbarSearch button", async () => {
            const { user } = testComponent(<ToolBar />)
            await user.click(await screen.findByRole("button", { name: "Search" }))

            expect(screen.getByRole("button", { name: "Close" })).toBeDefined()
            expect(screen.getByPlaceholderText("Search...")).toBeDefined()
        })

        it("Should not set search query immediately after typing", async () => {
            const { user } = testComponent(<ToolBar />)
            await user.click(await screen.findByRole("button", { name: "Search" }))
            await user.type(screen.getByRole("textbox"), "test query")

            expect(window.location.pathname).toBe("/")
        })

        describe("Debounce", () => {
            const debounceDelay = 511

            afterEach(() => {
                vi.restoreAllMocks()
            })

            it("Should not change search query if search input changes to empty string", async () => {
                const { user } = testComponent(<ToolBar />)
                await user.click(await screen.findByRole("button", { name: "Search" }))
                await user.type(screen.getByRole("textbox"), "test")

                vi.useFakeTimers()
                await act(() => vi.advanceTimersByTime(debounceDelay + 1))
                vi.useRealTimers()

                await waitFor(() => expect(window.location.pathname).toBe("/search"))
                expect(window.location.search).toBe("?query=test")
                await user.clear(screen.getByRole("textbox"))

                vi.useFakeTimers()
                await act(() => vi.advanceTimersByTime(debounceDelay + 1))
                vi.useRealTimers()

                await expect(
                    async () => await waitFor(() => expect(window.location.pathname).toBe("/search?query=")),
                ).rejects.toThrowError()
                expect(window.location.search).toBe("?query=test")
            })

            it("Should set search query with debounce delay after typing", async () => {
                const { user } = testComponent(<ToolBar />)

                await user.click(await screen.findByRole("button", { name: "Search" }))
                await user.type(screen.getByRole("textbox"), "test")
                await user.type(screen.getByRole("textbox"), " query")

                expect(window.location.pathname).toBe("/")

                vi.useFakeTimers()
                await act(() => vi.advanceTimersByTime(debounceDelay + 1))
                vi.useRealTimers()

                await waitFor(() => expect(window.location.pathname).toBe("/search?query=test+query"))
            })
        })

        it("Should close search field when pressing close", async () => {
            const { router, user } = testComponent(<ToolBar />)
            await act(async () => await router.navigate({to: "/search", search: {query: "test"}}));
            await user.click(await screen.findByRole("button", { name: "Search" }))
            await user.click(screen.getByRole("button", { name: "Close" }))

            expect(await screen.findByRole('button', {name: 'Share pool'})).toBeInTheDocument()
        })

        it("Should clear search query when pressing home", async () => {
            window.location.pathname = "/search?query=test"
            const { user } = testComponent(<ToolBar />)
            await user.click(await screen.findByRole("button", { name: "Home" }))

            expect(window.location.pathname).toBe("/")
        })
    })

    describe("Delete", () => {
        it("Should render delete pool as disabled if user has no pool", async () => {
            testComponent(<ToolBar />)
            expect(await screen.findByTitle("Delete pool")).toBeDefined()
            expect(screen.queryByRole("button", { name: "Delete pool" })).toBeNull()
        })

        it("Should not render delete pool at all if search field is opened", async () => {
            const {user} = testComponent(<ToolBar />)
            await user.click(await screen.findByRole("button", { name: "Search" }))
            expect(screen.queryByTitle("Delete pool")).toBeNull()
        })

        it("Should render delete pool as button if user has a pool", async () => {
            mockLoginState()
            usePoolStore.setState({ pool: mockedTrackPoolData() })
            mockAxiosGet(mockedTrackPoolData().owner)
            testComponent(<ToolBar />)

            expect(await screen.findByRole("button", { name: "Delete pool" })).toBeDefined()
        })

        it("Should display leave pool instead of delete pool if user is part of another user's pool", async () => {
            mockAxiosGet({ display_name: "Test", icon_url: null, spotify_id: "1234" })
            const mockPool = mockedCollectionPoolData()
            usePoolStore.setState({ pool: mockPool })

            testComponent(<ToolBar />)

            expect(await screen.findByRole("button", { name: "Leave pool" })).toBeDefined()
        })
    })

    describe("Share", () => {
        it("Should render share pool share field after clicking on share pool", async () => {
            const mockPool = mockedTrackPoolData()
            usePoolStore.setState({ pool: mockPool })
            mockPool.share_code = "123456"
            mockAxiosPost(mockPool)
            const { user } = testComponent(<ToolBar />)

            await user.click(await screen.findByRole("button", { name: "Share pool" }))

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

            const { user } = testComponent(<ToolBar />)

            await user.click(await screen.findByRole("button", { name: "Share pool" }))

            expect(screen.queryByText("123456")).toBeNull()
        })
    })

    describe("Join", () => {
        it("Should render code input after clicking join pool", async () => {
            const { user } = testComponent(<ToolBar />)
            await user.click(await screen.findByRole("button", { name: "Join pool" }))

            expect(screen.getByPlaceholderText("Pool code")).toBeDefined()
        })

        it("Should join pool after filling pool code and clicking join pool", async () => {
            const mockPool = mockedTrackPoolData()
            usePoolStore.setState({ pool: mockPool })
            mockPool.share_code = "123456"
            mockAxiosPost(mockPool)
            const { user } = testComponent(<ToolBar />)
            await user.click(await screen.findByRole("button", { name: "Join pool" }))
            await user.type(screen.getByPlaceholderText("Pool code"), "123456")
            await user.click(screen.getByRole("button", { name: "Join pool" }))

            expect(usePoolStore.getState().pool?.share_code).toBe("123456")
        })
    })

    describe("Playback", () => {
        it("Should display playback state if pool exists", async () => {
            const mockPool = mockedTrackPoolData()
            usePoolStore.setState({ pool: mockPool })
            testComponent(<ToolBar />)
            expect(
                await screen.findByRole("img", { name: `Currently playing ${mockPool.currently_playing.name} icon` }),
            ).toBeDefined()
            expect(screen.getByText(mockPool.currently_playing.name)).toBeDefined()
        })

        it("Should pause playback on clicking pause on playback display", async () => {
            const mockPool = mockedTrackPoolData()
            usePoolStore.setState({ pool: mockPool })
            mockAxiosPost({ ...mockPool, is_active: false })
            const { user } = testComponent(<ToolBar />)
            await user.click(await screen.findByRole("button", { name: "Pause" }))
            expect(screen.getByRole("button", { name: "Play" })).toBeDefined()
        })
    })
})
