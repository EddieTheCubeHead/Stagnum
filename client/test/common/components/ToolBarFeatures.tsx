import { describe, it, expect, vi, afterEach, beforeEach, beforeAll } from "vitest"
import { act, screen, waitFor } from "@testing-library/react"
import { ToolBar } from "../../../src/toolbar/components/ToolBar.tsx"
import { usePoolStore } from "../../../src/common/stores/poolStore"
import { mockedCollectionPoolData, mockedTrackPoolData } from "../../search/data/mockPoolData"
import { mockAxiosGet, mockAxiosPost } from "../../utils/mockAxios"
import axios from "axios"
import { testComponentWithRouter } from "../../utils/testComponent.tsx"
import { mockedSearchData } from "../../search/data/mockedSearchData.ts"
import { mockLoginState } from "../../utils/mockLoginState.ts"

describe("Tool bar", () => {
    describe("Search", () => {
        it("Should render toolbarSearch button initially", async () => {
            await testComponentWithRouter(<ToolBar />)
            expect(screen.getByRole("button", { name: "Search" })).toBeDefined()
        })

        it("Should not initially render toolbarSearch field and close toolbarSearch buttons", async () => {
            await testComponentWithRouter(<ToolBar />)
            expect(screen.queryByRole("button", { name: "Close search" })).toBeNull()
            expect(screen.queryByPlaceholderText("Search...")).toBeNull()
        })

        it("Should render toolbarSearch field and close toolbarSearch buttons after click on open toolbarSearch button", async () => {
            const { user } = await testComponentWithRouter(<ToolBar />)
            await user.click(screen.getByRole("button", { name: "Search" }))

            expect(screen.getByRole("button", { name: "Close" })).toBeDefined()
            expect(screen.getByPlaceholderText("Search...")).toBeDefined()
        })

        it("Should not set search query immediately after typing", async () => {
            const { user } = await testComponentWithRouter(<ToolBar />)
            await user.click(screen.getByRole("button", { name: "Search" }))
            await user.type(screen.getByRole("textbox"), "test query")

            expect(window.location.pathname).toBe("/")
        })

        describe("Debounce", () => {
            const debounceDelay = 511
            // Workaround for bug in @testing-library/react when using user-event with `vi.useFakeTimers()`
            // gotten from https://github.com/testing-library/user-event/issues/1115#issuecomment-1506220345
            beforeAll(() => {
                // @ts-expect-error - global fuckery
                const _jest = globalThis.jest

                // @ts-expect-error - global fuckery
                globalThis.jest = {
                    // @ts-expect-error - global fuckery
                    ...globalThis.jest,
                    advanceTimersByTime: vi.advanceTimersByTime.bind(vi),
                }

                // @ts-expect-error - global fuckery
                return () => void (globalThis.jest = _jest)
            })

            beforeEach(() => {
                vi.useFakeTimers()
            })

            afterEach(() => {
                vi.useRealTimers()
                vi.restoreAllMocks()
            })

            it("Should not change search query if search input changes to empty string", async () => {
                const { user } = await testComponentWithRouter(<ToolBar />, {
                    bonusRoutes: ["search"],
                    userEventOptions: { advanceTimers: vi.advanceTimersByTime },
                })
                await user.click(screen.getByRole("button", { name: "Search" }))
                await user.type(screen.getByRole("textbox"), "test")

                await act(() => vi.advanceTimersByTime(debounceDelay + 100))
                expect(window.location.pathname).toBe("/search")
                expect(window.location.search).toBe("?query=test")
                await user.clear(screen.getByRole("textbox"))

                await expect(
                    async () => await waitFor(() => expect(window.location.pathname).toBe("/search?query=")),
                ).rejects.toThrowError()
                expect(window.location.search).toBe("?query=test")
            })

            it("Should set search query with debounce delay after typing", async () => {
                const { user } = await testComponentWithRouter(<ToolBar />, {
                    bonusRoutes: ["search"],
                    userEventOptions: { advanceTimers: vi.advanceTimersByTime },
                })

                await user.click(screen.getByRole("button", { name: "Search" }))
                await user.type(screen.getByRole("textbox"), "test")
                await user.type(screen.getByRole("textbox"), " query")

                expect(window.location.pathname).toBe("/")

                await act(() => vi.advanceTimersByTime(debounceDelay + 100))

                expect(window.location.pathname).toBe("/search")
                expect(window.location.search).toBe("?query=test+query")
            })
        })

        it("Should close search field when pressing close", async () => {
            const { router, user } = await testComponentWithRouter(<ToolBar />, { bonusRoutes: ["search"] })
            await act(async () => await router.navigate({ to: "/search", search: { query: "test" } }))
            await user.click(screen.getByRole("button", { name: "Search" }))
            await user.click(screen.getByRole("button", { name: "Close" }))

            expect(await screen.findByRole("button", { name: "Share pool" })).toBeDefined()
        })

        it("Should clear search query when pressing home", async () => {
            const { router, user } = await testComponentWithRouter(<ToolBar />, { bonusRoutes: ["search"] })
            await act(async () => await router.navigate({ to: "/search", search: { query: "test" } }))
            await user.click(screen.getByRole("button", { name: "Home" }))

            expect(window.location.pathname).toBe("/")
        })
    })

    describe("Delete", () => {
        it("Should render delete pool as disabled if user has no pool", async () => {
            await testComponentWithRouter(<ToolBar />)
            expect(await screen.findByTitle("Delete pool")).toBeDefined()
            expect(screen.queryByRole("button", { name: "Delete pool" })).toBeNull()
        })

        it("Should not render delete pool at all if search field is opened", async () => {
            const { user } = await testComponentWithRouter(<ToolBar />)
            await user.click(screen.getByRole("button", { name: "Search" }))
            expect(screen.queryByTitle("Delete pool")).toBeNull()
        })

        it("Should render delete pool as button if user has a pool", async () => {
            mockLoginState()
            usePoolStore.setState({ pool: mockedTrackPoolData() })
            mockAxiosGet(mockedTrackPoolData().owner)
            await testComponentWithRouter(<ToolBar />)

            expect(screen.getByRole("button", { name: "Delete pool" })).toBeDefined()
        })

        it("Should display leave pool instead of delete pool if user is part of another user's pool", async () => {
            mockAxiosGet({ display_name: "Test", icon_url: null, spotify_id: "1234" })
            const mockPool = mockedCollectionPoolData()
            usePoolStore.setState({ pool: mockPool })

            await testComponentWithRouter(<ToolBar />)

            expect(screen.getByRole("button", { name: "Leave pool" })).toBeDefined()
        })
    })

    describe("Share", () => {
        it("Should render share pool share field after clicking on share pool", async () => {
            const mockPool = mockedTrackPoolData()
            usePoolStore.setState({ pool: mockPool })
            mockPool.share_code = "123456"
            mockAxiosPost(mockPool)
            const { user } = await testComponentWithRouter(<ToolBar />)

            await user.click(await screen.findByRole("button", { name: "Share pool" }))

            expect(screen.getByText("123456")).toBeDefined()
        })

        it("Should render share pool skeleton after clicking on share pool if pool is loading", async () => {
            const mockPool = mockedTrackPoolData()
            usePoolStore.setState({ pool: { ...mockPool } })
            mockPool.share_code = "123456"

            vi.spyOn(axios, "post").mockImplementation(async (_url, _config) => {
                await new Promise((resolve) => setTimeout(resolve, 999999))
                return mockedSearchData()
            })

            const { user } = await testComponentWithRouter(<ToolBar />)

            await user.click(await screen.findByRole("button", { name: "Share pool" }))

            expect(screen.queryByText("123456")).toBeNull()
        })
    })

    describe("Join", () => {
        it("Should render code input after clicking join pool", async () => {
            const { user } = await testComponentWithRouter(<ToolBar />)
            await user.click(screen.getByRole("button", { name: "Join pool" }))

            expect(screen.getByPlaceholderText("Pool code")).toBeDefined()
        })

        it("Should join pool after filling pool code and clicking join pool", async () => {
            const mockPool = mockedTrackPoolData()
            usePoolStore.setState({ pool: mockPool })
            mockPool.share_code = "123456"
            mockAxiosPost(mockPool)
            const { user } = await testComponentWithRouter(<ToolBar />)
            await user.click(screen.getByRole("button", { name: "Join pool" }))
            await user.type(screen.getByPlaceholderText("Pool code"), "123456")
            await user.click(screen.getByRole("button", { name: "Join pool" }))

            expect(usePoolStore.getState().pool?.share_code).toBe("123456")
        })
    })

    describe("Playback", () => {
        it("Should display playback state if pool exists", async () => {
            const mockPool = mockedTrackPoolData()
            usePoolStore.setState({ pool: mockPool })
            await testComponentWithRouter(<ToolBar />)
            expect(
                screen.getByRole("img", { name: `Currently playing ${mockPool.currently_playing.name} icon` }),
            ).toBeDefined()
            expect(screen.getByText(mockPool.currently_playing.name)).toBeDefined()
        })

        it("Should pause playback on clicking pause on playback display", async () => {
            const mockPool = mockedTrackPoolData()
            usePoolStore.setState({ pool: mockPool })
            mockAxiosPost({ ...mockPool, is_active: false })
            const { user } = await testComponentWithRouter(<ToolBar />)
            await user.click(screen.getByRole("button", { name: "Pause" }))
            expect(screen.getByRole("button", { name: "Play" })).toBeDefined()
        })
    })
})
