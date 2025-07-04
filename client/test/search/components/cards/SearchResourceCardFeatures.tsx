import { describe, it, expect, beforeEach } from "vitest"
import { SpotifyTrack } from "../../../../src/search/models/SpotifyTrack"
import { SpotifyArtist } from "../../../../src/search/models/SpotifyArtist"
import { SpotifyAlbum } from "../../../../src/search/models/SpotifyAlbum"
import { SpotifyPlaylist } from "../../../../src/search/models/SpotifyPlaylist"
import { screen } from "@testing-library/react"
import { SearchSpotifyTrackCard } from "../../../../src/search/components/cards/SearchSpotifyTrackCard"
import "@testing-library/jest-dom/vitest"
import { SearchSpotifyAlbumCard } from "../../../../src/search/components/cards/SearchSpotifyAlbumCard"
import { SearchSpotifyArtistCard } from "../../../../src/search/components/cards/SearchSpotifyArtistCard"
import { SearchSpotifyPlaylistCard } from "../../../../src/search/components/cards/SearchSpotifyPlaylistCard"
import { mockAxiosPost } from "../../../utils/mockAxios"
import { mockedCollectionPoolData, mockedTrackPoolData } from "../../data/mockPoolData"
import { usePoolStore } from "../../../../src/common/stores/poolStore"
import { useTokenStore } from "../../../../src/common/stores/tokenStore"
import { useAlertStore } from "../../../../src/alertSystem/alertStore"
import testComponent from "../../../utils/testComponent.tsx"

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
            testComponent(<SearchSpotifyTrackCard track={mockTrack} />)

            expect(screen.getByRole("link", { name: mockTrack.name })).toBeDefined()
        })

        it("Should render artist name as link", () => {
            testComponent(<SearchSpotifyTrackCard track={mockTrack} />)

            expect(screen.getByRole("link", { name: mockTrack.artists[0].name })).toBeDefined()
        })

        it("Should render track album icon", () => {
            testComponent(<SearchSpotifyTrackCard track={mockTrack} />)

            expect(screen.getByRole("img")).toHaveAttribute("src", mockTrack.album.icon_link)
        })
    })

    describe("AlbumCard", () => {
        it("Should render album name as link", () => {
            testComponent(<SearchSpotifyAlbumCard album={mockAlbum} />)

            expect(screen.getByRole("link", { name: mockAlbum.name })).toBeDefined()
        })

        it("Should render artist name as link", () => {
            testComponent(<SearchSpotifyAlbumCard album={mockAlbum} />)

            expect(screen.getByRole("link", { name: mockAlbum.artists[0].name })).toBeDefined()
        })

        it("Should render album icon", () => {
            testComponent(<SearchSpotifyAlbumCard album={mockAlbum} />)

            expect(screen.getByRole("img")).toHaveAttribute("src", mockAlbum.icon_link)
        })
    })

    describe("ArtistCard", () => {
        it("Should render artist name as link", () => {
            testComponent(<SearchSpotifyArtistCard artist={mockArtist} />)

            expect(screen.getByRole("link", { name: mockArtist.name })).toBeDefined()
        })

        it("Should render artist icon", () => {
            testComponent(<SearchSpotifyArtistCard artist={mockArtist} />)

            expect(screen.getByRole("img")).toHaveAttribute("src", mockArtist.icon_link)
        })
    })

    describe("PlaylistCard", () => {
        it("Should render playlist name as link", () => {
            testComponent(<SearchSpotifyPlaylistCard playlist={mockPlaylist} />)

            expect(screen.getByRole("link", { name: mockPlaylist.name })).toBeDefined()
        })

        it("Should render playlist icon", () => {
            testComponent(<SearchSpotifyPlaylistCard playlist={mockPlaylist} />)

            expect(screen.getByRole("img")).toHaveAttribute("src", mockPlaylist.icon_link)
        })
    })

    describe("Pool manipulation", () => {
        beforeEach(() => {
            useTokenStore.setState({ token: "my test token" })
        })

        it("Should start pool playback when clicking create pool without existing playback", async () => {
            const mock_pool_data = mockedTrackPoolData()
            mockAxiosPost(mock_pool_data)
            const { user } = testComponent(<SearchSpotifyTrackCard track={mockTrack} />)

            await user.click(screen.getByRole("button", { name: "Play" }))

            expect(usePoolStore.getState().pool).toBe(mock_pool_data)
        })

        it("Should show alert when successfully creating a pool", async () => {
            const mock_pool_data = mockedTrackPoolData()
            mockAxiosPost(mock_pool_data)
            const { user } = testComponent(<SearchSpotifyTrackCard track={mockTrack} />)

            await user.click(screen.getByRole("button", { name: "Play" }))

            expect(useAlertStore.getState().alerts[0].message).toBe(`Created a pool from "${mockTrack.name}"`)
        })

        it("Should confirm overriding pool creation with a modal", async () => {
            usePoolStore.setState({ pool: mockedTrackPoolData() })
            const { user } = testComponent(<SearchSpotifyArtistCard artist={mockArtist} />)

            await user.click(screen.getByRole("button", { name: "Play" }))

            await new Promise((resolve: TimerHandler) => setTimeout(resolve, 50))

            expect(usePoolStore.getState().confirmingOverwrite).toBe(mockArtist)
        })

        it("Should add resource to pool when pressing add button", async () => {
            const mock_pool_data = mockedTrackPoolData()
            mockAxiosPost(mock_pool_data)
            const { user } = testComponent(<SearchSpotifyTrackCard track={mockTrack} />)

            await user.click(screen.getByRole("button", { name: "Add" }))

            await new Promise((resolve: TimerHandler) => setTimeout(resolve, 50))

            expect(usePoolStore.getState().pool).toBe(mock_pool_data)
        })

        it("Should create alert when successfully adding resource to pool", async () => {
            const mock_pool_data = mockedTrackPoolData()
            mockAxiosPost(mock_pool_data)
            usePoolStore.setState({ pool: mockedCollectionPoolData() })
            const { user } = testComponent(<SearchSpotifyTrackCard track={mockTrack} />)

            await user.click(screen.getByRole("button", { name: "Add" }))

            expect(useAlertStore.getState().alerts[0].message).toBe(`Added "${mockTrack.name}" to pool`)
        })
    })
})
