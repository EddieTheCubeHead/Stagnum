import { useNavigate, useSearch } from "@tanstack/react-router"
import { useCallback } from "react"

type toggledType = "tracks" | "albums" | "artists" | "playlists"

const constructNavigateParams = (tracks: boolean, albums: boolean, artists: boolean, playlists: boolean) => {
    return {
        to: "/search",
        params: (prev: any) => prev,
        search: (prev: any) => ({ ...prev, openedTabs: { tracks, albums, artists, playlists } }),
        mask: {
            to: "/search",
            params: (prev: any) => prev,
            search: ({ query }: { query: string }) => ({
                query,
            }),
        },
        replace: true,
    }
}

export const useSearchStates = () => {
    const {
        openedTabs: { tracks, albums, artists, playlists } = {
            tracks: true,
            albums: true,
            artists: true,
            playlists: true,
        },
    } = useSearch({ from: "/search" })
    const isTracksFocused = tracks && !albums && !artists && !playlists
    const isAlbumsFocused = !tracks && albums && !artists && !playlists
    const isArtistsFocused = !tracks && !albums && artists && !playlists
    const isPlaylistsFocused = !tracks && !albums && !artists && playlists
    const navigate = useNavigate()

    const toggleCategory = useCallback(
        (toggledType: toggledType) => {
            void navigate(
                constructNavigateParams(
                    (toggledType === "tracks") !== tracks,
                    (toggledType === "albums") !== albums,
                    (toggledType === "artists") !== artists,
                    (toggledType === "playlists") !== playlists,
                ),
            )
        },
        [tracks, albums, artists, playlists],
    )

    const toggleFocus = useCallback(
        (toggledType: toggledType) => {
            switch (toggledType) {
                case "tracks":
                    if (isTracksFocused) {
                        return void navigate(constructNavigateParams(true, true, true, true))
                    }
                    return void navigate(constructNavigateParams(true, false, false, false))
                case "albums":
                    if (isAlbumsFocused) {
                        return void navigate(constructNavigateParams(true, true, true, true))
                    }
                    return void navigate(constructNavigateParams(false, true, false, false))
                case "artists":
                    if (isArtistsFocused) {
                        return void navigate(constructNavigateParams(true, true, true, true))
                    }
                    return void navigate(constructNavigateParams(false, false, true, false))
                case "playlists":
                    if (isPlaylistsFocused) {
                        return void navigate(constructNavigateParams(true, true, true, true))
                    }
                    return void navigate(constructNavigateParams(false, false, false, true))
            }
        },
        [tracks, albums, artists, playlists],
    )

    return {
        toggleFocus,
        toggleCategory,
        tracks,
        albums,
        artists,
        playlists,
        isTracksFocused,
        isAlbumsFocused,
        isArtistsFocused,
        isPlaylistsFocused,
    }
}
