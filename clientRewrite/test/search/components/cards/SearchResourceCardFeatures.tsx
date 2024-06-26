import { describe, it, expect, beforeEach } from "vitest"
import { SpotifyTrack } from "../../../../src/search/models/SpotifyTrack"
import { SpotifyArtist } from "../../../../src/search/models/SpotifyArtist"
import { SpotifyAlbum } from "../../../../src/search/models/SpotifyAlbum"
import { SpotifyPlaylist } from "../../../../src/search/models/SpotifyPlaylist"
import { act, render, screen } from "@testing-library/react"
import { SearchSpotifyTrackCard } from "../../../../src/search/components/cards/SearchSpotifyTrackCard"
import "@testing-library/jest-dom/vitest"
import { SearchSpotifyAlbumCard } from "../../../../src/search/components/cards/SearchSpotifyAlbumCard"
import { SearchSpotifyArtistCard } from "../../../../src/search/components/cards/SearchSpotifyArtistCard"
import { SearchSpotifyPlaylistCard } from "../../../../src/search/components/cards/SearchSpotifyPlaylistCard"
import { mockAxiosDelete, mockAxiosPost } from "../../../utils/mockAxios"
import { mockedTrackPoolData } from "../../data/mockPoolData"
import { usePoolStore } from "../../../../src/common/stores/poolStore"
import { useTokenStore } from "../../../../src/common/stores/tokenStore"

describe("SearchResourceCard", () => {
    const mockArtist: SpotifyArtist = {
        name: "Cory Wong",
        link: "example.spotify.com/cory_wong",
        icon_link: "example.spotify.com/cory_wong.png",
        uri: "spotify:artist:mock_uri",
    }

    const mockAlbum: SpotifyAlbum = {
        name: "The Striped Album",
        link: "example.spotify.com/the_striped_album",
        icon_link: "example.spotify.com/the_striped_album.png",
        uri: "spotify:album:mock_uri",
        year: 2020,
        artists: [mockArtist],
    }

    const mockTrack: SpotifyTrack = {
        name: "Smooth Move",
        link: "example.spotify.com/smooth_move",
        album: mockAlbum,
        artists: [mockArtist],
        uri: "spotify:track:mock_uri",
        duration_ms: 316528,
    }

    const mockPlaylist: SpotifyPlaylist = {
        name: "My playlist",
        link: "example.spotify.com/my_playlist",
        icon_link: "example.spotify.com/my_playlist.png",
        uri: "spotify:playlist:mock_uri",
    }

    describe("TrackCard", () => {
        it("Should render track name as link", () => {
            render(<SearchSpotifyTrackCard track={mockTrack} />)

            expect(screen.getByRole("link", { name: mockTrack.name })).toBeDefined()
        })

        it("Should render artist name as link", () => {
            render(<SearchSpotifyTrackCard track={mockTrack} />)

            expect(screen.getByRole("link", { name: mockTrack.artists[0].name })).toBeDefined()
        })

        it("Should render track album icon", () => {
            render(<SearchSpotifyTrackCard track={mockTrack} />)

            expect(screen.getByRole("img")).toHaveAttribute("src", mockTrack.album.icon_link)
        })
    })

    describe("AlbumCard", () => {
        it("Should render album name as link", () => {
            render(<SearchSpotifyAlbumCard album={mockAlbum} />)

            expect(screen.getByRole("link", { name: mockAlbum.name })).toBeDefined()
        })

        it("Should render artist name as link", () => {
            render(<SearchSpotifyAlbumCard album={mockAlbum} />)

            expect(screen.getByRole("link", { name: mockAlbum.artists[0].name })).toBeDefined()
        })

        it("Should render album icon", () => {
            render(<SearchSpotifyAlbumCard album={mockAlbum} />)

            expect(screen.getByRole("img")).toHaveAttribute("src", mockAlbum.icon_link)
        })
    })

    describe("ArtistCard", () => {
        it("Should render artist name as link", () => {
            render(<SearchSpotifyArtistCard artist={mockArtist} />)

            expect(screen.getByRole("link", { name: mockArtist.name })).toBeDefined()
        })

        it("Should render artist icon", () => {
            render(<SearchSpotifyArtistCard artist={mockArtist} />)

            expect(screen.getByRole("img")).toHaveAttribute("src", mockArtist.icon_link)
        })
    })

    describe("PlaylistCard", () => {
        it("Should render playlist name as link", () => {
            render(<SearchSpotifyPlaylistCard playlist={mockPlaylist} />)

            expect(screen.getByRole("link", { name: mockPlaylist.name })).toBeDefined()
        })

        it("Should render playlist icon", () => {
            render(<SearchSpotifyPlaylistCard playlist={mockPlaylist} />)

            expect(screen.getByRole("img")).toHaveAttribute("src", mockPlaylist.icon_link)
        })
    })

    describe("Pool manipulation", () => {
        beforeEach(() => {
            useTokenStore.setState({ token: "my test token" })
        })

        // @ts-expect-error
        it("Should start pool playback when clicking create pool without existing playback", async () => {
            const mock_pool_data = mockedTrackPoolData()
            mockAxiosPost(mock_pool_data)
            render(<SearchSpotifyTrackCard track={mockTrack} />)

            act(() => screen.getByRole("button", { name: "Play" }).click())

            // @ts-expect-error
            await new Promise((resolve: TimerHandler) => setTimeout(resolve, 50))

            expect(usePoolStore.getState().pool).toBe(mock_pool_data)
        })

        // @ts-expect-error
        it("Should confirm overriding pool creation with a modal", async () => {
            usePoolStore.setState({ pool: mockedTrackPoolData() })
            render(<SearchSpotifyArtistCard artist={mockArtist} />)

            act(() => screen.getByRole("button", { name: "Play" }).click())

            // @ts-expect-error
            await new Promise((resolve: TimerHandler) => setTimeout(resolve, 50))

            expect(usePoolStore.getState().confirmingOverwrite).toBe(mockArtist.uri)
        })

        // @ts-expect-error
        it("Should add resource to pool when pressing add button", async () => {
            const mock_pool_data = mockedTrackPoolData()
            mockAxiosPost(mock_pool_data)
            render(<SearchSpotifyTrackCard track={mockTrack} />)

            act(() => screen.getByRole("button", { name: "Add" }).click())

            // @ts-expect-error
            await new Promise((resolve: TimerHandler) => setTimeout(resolve, 50))

            expect(usePoolStore.getState().pool).toBe(mock_pool_data)
        })
    })
})
