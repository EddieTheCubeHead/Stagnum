import { describe, it, expect } from "vitest"
import { act, render, screen } from "@testing-library/react"
import { SearchTopBar } from "../../../src/search/components/searchTopBar/SearchTopBar"
import { useSearchStore } from "../../../src/common/stores/searchStore"

describe("SearchTopBar", () => {
    it("Should set tracks as the only open category on click on tracks button", () => {
        render(<SearchTopBar />)

        act(() => {
            screen.getByRole("button", { name: "Track Tracks" }).click()
        })

        expect(useSearchStore.getState().isTracksOpened).toBe(true)
        expect(useSearchStore.getState().isAlbumsOpened).toBe(false)
        expect(useSearchStore.getState().isArtistsOpened).toBe(false)
        expect(useSearchStore.getState().isPlaylistOpened).toBe(false)
    })

    it("Should set all categories as open on second click on tracks button", () => {
        render(<SearchTopBar />)

        act(() => {
            screen.getByRole("button", { name: "Track Tracks" }).click()
            screen.getByRole("button", { name: "Track Tracks" }).click()
        })

        expect(useSearchStore.getState().isTracksOpened).toBe(true)
        expect(useSearchStore.getState().isAlbumsOpened).toBe(true)
        expect(useSearchStore.getState().isArtistsOpened).toBe(true)
        expect(useSearchStore.getState().isPlaylistOpened).toBe(true)
    })

    it("Should set albums as the only open category on click on albums button", () => {
        render(<SearchTopBar />)

        act(() => {
            screen.getByRole("button", { name: "Album Albums" }).click()
        })

        expect(useSearchStore.getState().isTracksOpened).toBe(false)
        expect(useSearchStore.getState().isAlbumsOpened).toBe(true)
        expect(useSearchStore.getState().isArtistsOpened).toBe(false)
        expect(useSearchStore.getState().isPlaylistOpened).toBe(false)
    })

    it("Should set all categories as open on second click on albums button", () => {
        render(<SearchTopBar />)

        act(() => {
            screen.getByRole("button", { name: "Album Albums" }).click()
            screen.getByRole("button", { name: "Album Albums" }).click()
        })

        expect(useSearchStore.getState().isTracksOpened).toBe(true)
        expect(useSearchStore.getState().isAlbumsOpened).toBe(true)
        expect(useSearchStore.getState().isArtistsOpened).toBe(true)
        expect(useSearchStore.getState().isPlaylistOpened).toBe(true)
    })

    it("Should set artists as the only open category on click on artists button", () => {
        render(<SearchTopBar />)

        act(() => {
            screen.getByRole("button", { name: "Artist Artists" }).click()
        })

        expect(useSearchStore.getState().isTracksOpened).toBe(false)
        expect(useSearchStore.getState().isAlbumsOpened).toBe(false)
        expect(useSearchStore.getState().isArtistsOpened).toBe(true)
        expect(useSearchStore.getState().isPlaylistOpened).toBe(false)
    })

    it("Should set all categories as open on second click on artists button", () => {
        render(<SearchTopBar />)

        act(() => {
            screen.getByRole("button", { name: "Artist Artists" }).click()
            screen.getByRole("button", { name: "Artist Artists" }).click()
        })

        expect(useSearchStore.getState().isTracksOpened).toBe(true)
        expect(useSearchStore.getState().isAlbumsOpened).toBe(true)
        expect(useSearchStore.getState().isArtistsOpened).toBe(true)
        expect(useSearchStore.getState().isPlaylistOpened).toBe(true)
    })

    it("Should set playlists as the only open category on click on playlists button", () => {
        render(<SearchTopBar />)

        act(() => {
            screen.getByRole("button", { name: "Playlist Playlists" }).click()
        })

        expect(useSearchStore.getState().isTracksOpened).toBe(false)
        expect(useSearchStore.getState().isAlbumsOpened).toBe(false)
        expect(useSearchStore.getState().isArtistsOpened).toBe(false)
        expect(useSearchStore.getState().isPlaylistOpened).toBe(true)
    })

    it("Should set all categories as open on second click on playlists button", () => {
        render(<SearchTopBar />)

        act(() => {
            screen.getByRole("button", { name: "Playlist Playlists" }).click()
            screen.getByRole("button", { name: "Playlist Playlists" }).click()
        })

        expect(useSearchStore.getState().isTracksOpened).toBe(true)
        expect(useSearchStore.getState().isAlbumsOpened).toBe(true)
        expect(useSearchStore.getState().isArtistsOpened).toBe(true)
        expect(useSearchStore.getState().isPlaylistOpened).toBe(true)
    })
})
