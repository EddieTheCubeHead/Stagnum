import { describe, it, expect, vi, afterEach, beforeEach, beforeAll, afterAll } from "vitest"
import { act, screen, waitFor } from "@testing-library/react"
import { testApp } from "../utils/testComponent.tsx"
import { mockLoginState } from "../utils/mockLoginState.ts"
import { server } from "./server.ts"
import { post, defaultToken, get } from "./handlers.ts"
import { foreignPool, mockedCollectionPoolData, sharedPool } from "./data/pool.ts"
import { mockSearchData } from "./data/search"
import { http, HttpResponse } from "msw"
import { TEST_BACKEND_URL } from "../../setup-vitest"

describe("Tool bar", () => {
    beforeAll(() => {
        server.listen()
    })

    afterEach(() => server.resetHandlers())

    afterAll(() => server.close())

    beforeEach(() => {
        vi.resetAllMocks()
        mockLoginState()
    })

    describe("Search", () => {
        it("Should render toolbarSearch button initially", async () => {
            await testApp()
            expect(screen.getByRole("button", { name: "Search" })).toBeVisible()
        })

        it("Should not initially render toolbarSearch field and close toolbarSearch buttons", async () => {
            await testApp()
            expect(screen.queryByRole("button", { name: "Close search" })).not.toBeInTheDocument()
            expect(screen.queryByPlaceholderText("Search...")).not.toBeInTheDocument()
        })

        it("Should render toolbarSearch field and close toolbarSearch buttons after click on open toolbarSearch button", async () => {
            const { user } = await testApp()
            await user.click(screen.getByRole("button", { name: "Search" }))

            expect(screen.getByRole("button", { name: "Close" })).toBeVisible()
            expect(screen.getByPlaceholderText("Search...")).toBeVisible()
        })

        it("Should not set search query immediately after typing", async () => {
            const { user } = await testApp()
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
                const { user, router } = await testApp({ userEventOptions: { advanceTimers: vi.advanceTimersByTime } })
                server.use(get("pool", {}))
                server.use(
                    http.get(`${TEST_BACKEND_URL}/search`, async ({ request }) => {
                        const url = new URL(request.url)
                        if (url.searchParams.get("query") === "") {
                            throw new Error("Expected not to call search with empty query")
                        }
                        return HttpResponse.json(mockSearchData, { headers: { Authorization: defaultToken } })
                    }),
                )

                expect(screen.queryByText("Tracks")).not.toBeInTheDocument()

                await user.click(screen.getByRole("button", { name: "Search" }))
                await user.type(screen.getByPlaceholderText("Search..."), "test")

                await act(async () => {
                    vi.advanceTimersByTime(debounceDelay + 100)
                    await router.invalidate()
                })

                expect(await screen.findByRole("heading", { name: "Tracks" })).toBeVisible()

                await user.clear(screen.getByRole("textbox"))
                await act(async () => {
                    vi.advanceTimersByTime(debounceDelay + 100)
                    await router.invalidate()
                })

                expect(screen.getByRole("heading", { name: "Tracks" })).toBeVisible()
            })

            it("Should set search query with debounce delay after typing", async () => {
                const { user, router } = await testApp({ userEventOptions: { advanceTimers: vi.advanceTimersByTime } })

                await user.click(screen.getByRole("button", { name: "Search" }))
                await user.type(screen.getByRole("textbox"), "test")

                expect(screen.queryByRole("heading", { name: "Tracks" })).not.toBeInTheDocument()

                await user.type(screen.getByRole("textbox"), " query")

                expect(screen.queryByRole("heading", { name: "Tracks" })).not.toBeInTheDocument()

                await act(async () => {
                    vi.advanceTimersByTime(debounceDelay + 100)
                    await router.invalidate()
                })

                expect(await screen.findByRole("heading", { name: "Tracks" })).toBeVisible()
            })
        })

        it("Should close search field when pressing close", async () => {
            const { router, user } = await testApp()
            await act(async () => await router.navigate({ to: "/search", search: { query: "test" } }))
            await user.click(screen.getByRole("button", { name: "Search" }))
            await user.click(screen.getByRole("button", { name: "Close" }))

            expect(await screen.findByRole("button", { name: "Share pool" })).toBeVisible()
        })

        it("Should clear search query when pressing home", async () => {
            const { router, user } = await testApp()
            await act(async () => await router.navigate({ to: "/search", search: { query: "test" } }))
            await user.click(screen.getByRole("button", { name: "Home" }))

            expect(window.location.pathname).toBe("/")
        })
    })

    describe("Delete", () => {
        it("Should render delete pool as disabled if user has no pool", async () => {
            server.use(get("pool", null))
            await testApp()
            expect(await screen.findByTitle("Delete pool")).not.toBeVisible()
            expect(screen.queryByRole("button", { name: "Delete pool" })).not.toBeInTheDocument()
        })

        it("Should not render delete pool at all if search field is opened", async () => {
            const { user } = await testApp()
            await user.click(screen.getByRole("button", { name: "Search" }))
            expect(screen.queryByTitle("Delete pool")).not.toBeInTheDocument()
        })

        it("Should render delete pool as button if user has a pool", async () => {
            await testApp()

            expect(screen.getByRole("button", { name: "Delete pool" })).toBeVisible()
        })

        it("Should display leave pool instead of delete pool if user is part of another user's pool", async () => {
            server.use(get("pool", foreignPool))
            await testApp()

            expect(screen.getByRole("button", { name: "Leave pool" })).toBeVisible()
        })
    })

    describe("Share", () => {
        it("Should render share pool share field after clicking on share pool", async () => {
            const { user } = await testApp()

            await user.click(await screen.findByRole("button", { name: "Share pool" }))

            await waitFor(() => expect(screen.getByText(sharedPool.share_code!)).toBeVisible())
        })

        it("Should render share pool skeleton after clicking on share pool if pool is loading", async () => {
            server.use(post("/pool/share", null, "infinite"))

            const { user } = await testApp()

            await user.click(await screen.findByRole("button", { name: "Share pool" }))

            expect(screen.queryByText("123456")).not.toBeInTheDocument()
        })
    })

    describe("Join", () => {
        it("Should render code input after clicking join pool", async () => {
            const { user } = await testApp()
            await user.click(screen.getByRole("button", { name: "Join pool" }))

            expect(screen.getByPlaceholderText("Pool code")).toBeVisible()
        })

        it("Should join pool after filling pool code and clicking join pool", async () => {
            const { user } = await testApp()
            await user.click(screen.getByRole("button", { name: "Join pool" }))
            await user.type(screen.getByPlaceholderText("Pool code"), "123456")
            await user.click(screen.getByRole("button", { name: "Join pool" }))

            await waitFor(() => expect(screen.getByText(foreignPool.owner.display_name)).toBeVisible())
        })
    })

    describe("Playback", () => {
        it("Should display playback state if pool exists", async () => {
            const mockPool = mockedCollectionPoolData
            await testApp()
            expect(
                screen.getByRole("img", { name: `Currently playing ${mockPool.currently_playing.name} icon` }),
            ).toBeVisible()
            expect(screen.getByText(mockPool.currently_playing.name)).toBeVisible()
        })

        it("Should pause playback on clicking pause on playback display", async () => {
            const { user } = await testApp()
            await user.click(screen.getByRole("button", { name: "Pause" }))
            expect(screen.getByRole("button", { name: "Play" })).toBeVisible()
        })
    })
})
