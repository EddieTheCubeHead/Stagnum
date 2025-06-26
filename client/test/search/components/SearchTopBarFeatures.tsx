import { describe, it, expect } from "vitest"
import { screen } from "@testing-library/react"
import { SearchTopBar } from "../../../src/search/components/searchTopBar/SearchTopBar"
import { useSearchStore } from "../../../src/common/stores/searchStore"
import testComponent from "../../utils/testComponent.tsx"

describe("SearchTopBar", () => {
    it("Should set tracks as the only open category on click on tracks button", async () => {
        const { user } = testComponent(<SearchTopBar />)

        await user.click(screen.getByRole("button", { name: "Track Tracks" }))

        expect(useSearchStore.getState().isTracksOpened).toBe(true)
        expect(useSearchStore.getState().isAlbumsOpened).toBe(false)
        expect(useSearchStore.getState().isArtistsOpened).toBe(false)
        expect(useSearchStore.getState().isPlaylistOpened).toBe(false)
    })

    it("Should set all categories as open on second click on tracks button", async () => {
        const { user } = testComponent(<SearchTopBar />)

        await user.click(screen.getByRole("button", { name: "Track Tracks" }))
        await user.click(screen.getByRole("button", { name: "Track Tracks" }))

        expect(useSearchStore.getState().isTracksOpened).toBe(true)
        expect(useSearchStore.getState().isAlbumsOpened).toBe(true)
        expect(useSearchStore.getState().isArtistsOpened).toBe(true)
        expect(useSearchStore.getState().isPlaylistOpened).toBe(true)
    })

    it("Should set albums as the only open category on click on albums button", async () => {
        const { user } = testComponent(<SearchTopBar />)

        await user.click(screen.getByRole("button", { name: "Album Albums" }))

        expect(useSearchStore.getState().isTracksOpened).toBe(false)
        expect(useSearchStore.getState().isAlbumsOpened).toBe(true)
        expect(useSearchStore.getState().isArtistsOpened).toBe(false)
        expect(useSearchStore.getState().isPlaylistOpened).toBe(false)
    })

    it("Should set all categories as open on second click on albums button", async () => {
        const { user } = testComponent(<SearchTopBar />)

        await user.click(screen.getByRole("button", { name: "Album Albums" }))
        await user.click(screen.getByRole("button", { name: "Album Albums" }))

        expect(useSearchStore.getState().isTracksOpened).toBe(true)
        expect(useSearchStore.getState().isAlbumsOpened).toBe(true)
        expect(useSearchStore.getState().isArtistsOpened).toBe(true)
        expect(useSearchStore.getState().isPlaylistOpened).toBe(true)
    })

    it("Should set artists as the only open category on click on artists button", async () => {
        const { user } = testComponent(<SearchTopBar />)

        await user.click(screen.getByRole("button", { name: "Artist Artists" }))

        expect(useSearchStore.getState().isTracksOpened).toBe(false)
        expect(useSearchStore.getState().isAlbumsOpened).toBe(false)
        expect(useSearchStore.getState().isArtistsOpened).toBe(true)
        expect(useSearchStore.getState().isPlaylistOpened).toBe(false)
    })

    it("Should set all categories as open on second click on artists button", async () => {
        const { user } = testComponent(<SearchTopBar />)

        await user.click(screen.getByRole("button", { name: "Artist Artists" }))
        await user.click(screen.getByRole("button", { name: "Artist Artists" }))

        expect(useSearchStore.getState().isTracksOpened).toBe(true)
        expect(useSearchStore.getState().isAlbumsOpened).toBe(true)
        expect(useSearchStore.getState().isArtistsOpened).toBe(true)
        expect(useSearchStore.getState().isPlaylistOpened).toBe(true)
    })

    it("Should set playlists as the only open category on click on playlists button", async () => {
        const { user } = testComponent(<SearchTopBar />)

        await user.click(screen.getByRole("button", { name: "Playlist Playlists" }))

        expect(useSearchStore.getState().isTracksOpened).toBe(false)
        expect(useSearchStore.getState().isAlbumsOpened).toBe(false)
        expect(useSearchStore.getState().isArtistsOpened).toBe(false)
        expect(useSearchStore.getState().isPlaylistOpened).toBe(true)
    })

    it("Should set all categories as open on second click on playlists button", async () => {
        const { user } = testComponent(<SearchTopBar />)

        await user.click(screen.getByRole("button", { name: "Playlist Playlists" }))
        await user.click(screen.getByRole("button", { name: "Playlist Playlists" }))

        expect(useSearchStore.getState().isTracksOpened).toBe(true)
        expect(useSearchStore.getState().isAlbumsOpened).toBe(true)
        expect(useSearchStore.getState().isArtistsOpened).toBe(true)
        expect(useSearchStore.getState().isPlaylistOpened).toBe(true)
    })
})
