import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from "vitest"
import { testApp } from "./utils/testComponent.tsx"
import { act, screen } from "@testing-library/react"
import { mockLoginState } from "./utils/mockLoginState.ts"
import { server } from "./server.ts"
import { UserEvent } from "@testing-library/user-event/dist/cjs/setup/setup.js"
import { get, post } from "./handlers.ts"
import { mockSearchData, mockUniqueResultSearchData } from "./data/search.ts"
import { mockedTrackPoolData } from "./data/pool.ts"

const searchCategories = ["tracks", "albums", "artists", "playlists"] as const
const searchCategoryNames = ["Track", "Album", "Artist", "Playlist"] as const
type openStatesType = {
    [C in (typeof searchCategories)[number]]: boolean
}

describe("Search acceptance tests", () => {
    const debounceDelay = 511
    // Workaround for bug in @testing-library/react when using user-event with `vi.useFakeTimers()`
    // gotten from https://github.com/testing-library/user-event/issues/1115#issuecomment-1506220345
    beforeAll(() => {
        server.listen({ onUnhandledRequest: "error" })

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

    afterEach(() => {
        server.resetHandlers()
        vi.useRealTimers()
    })

    afterAll(() => server.close())

    beforeEach(() => {
        vi.resetAllMocks()
        vi.useFakeTimers({ toFake: ["setTimeout", "clearTimeout"] })
        mockLoginState()
    })

    const search = async (user: UserEvent, router: Awaited<ReturnType<typeof testApp>>["router"], text: string) => {
        await user.click(screen.getByRole("button", { name: "Search" }))
        await user.type(screen.getByPlaceholderText("Search..."), text)
        await act(async () => {
            vi.advanceTimersByTime(debounceDelay)
            await router.invalidate()
        })
    }

    it("Should not render search if query is null", async () => {
        const { user } = await testApp({ userEventOptions: { advanceTimers: vi.advanceTimersByTime } })

        await user.click(screen.getByRole("button", { name: "Search" }))
        expect(screen.queryByRole("heading", { name: "Tracks" })).not.toBeInTheDocument()
    })

    it("Should render search if search query set", async () => {
        const { user, router } = await testApp({ userEventOptions: { advanceTimers: vi.advanceTimersByTime } })

        await search(user, router, "My search query")
        expect(await screen.findByRole("heading", { name: "Tracks" })).toBeVisible()
    })

    it("Should keep rendering search if query set and then cleared completely", async () => {
        const { user, router } = await testApp({ userEventOptions: { advanceTimers: vi.advanceTimersByTime } })

        await search(user, router, "My search query")
        expect(await screen.findByRole("heading", { name: "Tracks" })).toBeVisible()
        await user.clear(screen.getByPlaceholderText("Search..."))
        expect(await screen.findByRole("heading", { name: "Tracks" })).toBeVisible()
    })

    it("Should render data for search results", async () => {
        server.use(get("search", mockUniqueResultSearchData))
        const { user, router } = await testApp({ userEventOptions: { advanceTimers: vi.advanceTimersByTime } })

        await search(user, router, "My search query")
        expect(await screen.findByRole("heading", { name: "Tracks" })).toBeVisible()
        mockUniqueResultSearchData.tracks.items.forEach((track) => {
            expect(screen.getByRole("link", { name: track.name })).toBeVisible()
            expect(screen.getByRole("link", { name: track.artists[0].name })).toBeVisible()
            expect(screen.getByAltText(`Album ${track.album.name} icon`)).toHaveAttribute("src", track.album.icon_link)
        })
        mockUniqueResultSearchData.albums.items.forEach((album) => {
            expect(screen.getByRole("link", { name: album.name })).toBeVisible()
            expect(screen.getByRole("link", { name: album.artists[0].name })).toBeVisible()
            expect(screen.getByAltText(`Album ${album.name} icon`)).toHaveAttribute("src", album.icon_link)
        })
        mockUniqueResultSearchData.artists.items.forEach((artist) => {
            expect(screen.getByRole("link", { name: artist.name })).toBeVisible()
            expect(screen.getByAltText(`Album ${artist.name} icon`)).toHaveAttribute("src", artist.icon_link)
        })
        mockUniqueResultSearchData.playlists.items.forEach((playlist) => {
            expect(screen.getByRole("link", { name: playlist.name })).toBeVisible()
            expect(screen.getByAltText(`Album ${playlist.name} icon`)).toHaveAttribute("src", playlist.icon_link)
        })
    })

    describe.each(searchCategoryNames)("Search category %s title card", (resourceType) => {
        it("Should render header for category", async () => {
            const { user, router } = await testApp({ userEventOptions: { advanceTimers: vi.advanceTimersByTime } })

            await search(user, router, "My search query")

            expect(await screen.findByRole("heading", { name: `${resourceType}s` })).toBeVisible()
        })

        it("Should render collapse icon initially", async () => {
            const { user, router } = await testApp({ userEventOptions: { advanceTimers: vi.advanceTimersByTime } })

            await search(user, router, "My search query")

            expect(await screen.findByRole("button", { name: `Collapse ${resourceType.toLowerCase()}s` })).toBeVisible()
        })

        it("Should render open icon after collapsing category", async () => {
            const { user, router } = await testApp({ userEventOptions: { advanceTimers: vi.advanceTimersByTime } })

            await search(user, router, "My search query")

            await user.click(await screen.findByRole("button", { name: `Collapse ${resourceType.toLowerCase()}s` }))
            expect(await screen.findByRole("button", { name: `Open ${resourceType.toLowerCase()}s` })).toBeVisible()
        })
    })

    describe("Search top bar", () => {
        const assertSearchCategoriesOpenState = (openStates: openStatesType): void => {
            for (const [category, shouldBeOpen] of Object.entries(openStates)) {
                expect(
                    screen.getByRole("button", { name: `${shouldBeOpen ? "Collapse" : "Open"} ${category}` }),
                ).toBeVisible()
            }
        }
        describe.each(searchCategoryNames)("%s", (resourceType) => {
            it("Should render search result categories if query exists", async () => {
                const { user, router } = await testApp({ userEventOptions: { advanceTimers: vi.advanceTimersByTime } })

                await search(user, router, "My search query")

                expect(await screen.findByRole("heading", { name: `${resourceType}s` })).toBeVisible()
            })

            it("Should not render empty categories when data is loading", async () => {
                server.use(get("search", mockSearchData, "infinite"))
                const { user, router } = await testApp({ userEventOptions: { advanceTimers: vi.advanceTimersByTime } })
                await search(user, router, "My search query")

                expect(screen.queryByRole("heading", { name: `${resourceType}s` })).not.toBeInTheDocument()
            })

            it("Should render category buttons in top bar", async () => {
                const { user, router } = await testApp({ userEventOptions: { advanceTimers: vi.advanceTimersByTime } })
                await search(user, router, "My search query")

                expect(await screen.findByRole("button", { name: `${resourceType}s` })).toBeInTheDocument()
            })

            it("Should not render category buttons when data is loading", async () => {
                server.use(get("search", mockSearchData, "infinite"))
                const { user, router } = await testApp({ userEventOptions: { advanceTimers: vi.advanceTimersByTime } })
                await search(user, router, "My search query")

                expect(screen.queryByRole("button", { name: `${resourceType}s` })).not.toBeInTheDocument()
            })

            it(`Should set ${resourceType.toLowerCase()}s as the only open category on click ${resourceType.toLowerCase()}s button`, async () => {
                const { user, router } = await testApp({ userEventOptions: { advanceTimers: vi.advanceTimersByTime } })
                await search(user, router, "My search query")

                await user.click(await screen.findByRole("button", { name: `${resourceType}s` }))

                assertSearchCategoriesOpenState(
                    searchCategories.reduce(
                        (accumulator, currentValue) => {
                            accumulator[currentValue] = currentValue === `${resourceType.toLowerCase()}s`
                            return accumulator
                        },
                        { tracks: false, albums: false, artists: false, playlists: false } as openStatesType,
                    ),
                )
            })

            it(`Should set all categories as open on second click on ${resourceType.toLowerCase()}s button`, async () => {
                const { user, router } = await testApp({ userEventOptions: { advanceTimers: vi.advanceTimersByTime } })
                await search(user, router, "My search query")

                await user.click(await screen.findByRole("button", { name: `${resourceType}s` }))
                await user.click(screen.getByRole("button", { name: `${resourceType}s` }))

                assertSearchCategoriesOpenState({ tracks: true, albums: true, artists: true, playlists: true })
            })
        })
    })

    describe("Pool manipulation", () => {
        it("Should start pool playback when clicking create pool without existing playback", async () => {
            server.use(get("pool", null))
            server.use(post("pool", mockedTrackPoolData))
            const { user, router } = await testApp({ userEventOptions: { advanceTimers: vi.advanceTimersByTime } })

            await search(user, router, "My search query")

            await user.click(
                await screen.findByRole("button", { name: `Create pool from ${mockSearchData.tracks.items[1].name}` }),
            )

            expect(await screen.findByText(mockedTrackPoolData.users[0].tracks[0].name)).toBeVisible()
            expect(screen.getByText(`Created a pool from "${mockSearchData.tracks.items[1].name}"`))
        })

        it("Should add resource to pool when pressing add button", async () => {
            server.use(post("pool/content", mockedTrackPoolData))
            const { user, router } = await testApp({ userEventOptions: { advanceTimers: vi.advanceTimersByTime } })

            await search(user, router, "My search query")

            await user.click(
                await screen.findByRole("button", { name: `Add ${mockSearchData.tracks.items[1].name} to pool` }),
            )

            expect(await screen.findByText(mockedTrackPoolData.users[0].tracks[0].name)).toBeVisible()
            expect(screen.getByText(`Added "${mockSearchData.tracks.items[1].name}" to pool`))
        })
    })
})
