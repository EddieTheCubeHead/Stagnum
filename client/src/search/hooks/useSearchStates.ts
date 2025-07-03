import { useNavigate, useSearch } from "@tanstack/react-router"
import { useCallback } from "react"

type toggledType = "tracks" | "albums" | "artists" | "playlists"

const constructNavigateParams = (tracks: boolean, albums: boolean, artists: boolean, playlists: boolean) => {
    return {
        to: "/search",
        params: (prev: any) => prev,
        search: (prev: any) => ({ ...prev, tracks, albums, artists, playlists }),
        replace: true,
    }
}

export const useSearchStates = () => {
    const { tracks, albums, artists, playlists } = useSearch({ from: "/search" })
    const onlyTracksOpen = tracks && !albums && !artists && !playlists
    const onlyAlbumsOpen = !tracks && albums && !artists && !playlists
    const onlyArtistsOpen = !tracks && !albums && artists && !playlists
    const onlyPlaylistsOpen = !tracks && !albums && !artists && playlists
    const navigate = useNavigate()

    const toggleSingle = useCallback(
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

    const toggleTopBar = useCallback(
        (toggledType: toggledType) => {
            switch (toggledType) {
                case "tracks":
                    if (onlyTracksOpen) {
                        return void navigate(constructNavigateParams(true, true, true, true))
                    }
                    return void navigate(constructNavigateParams(true, false, false, false))
                case "albums":
                    if (onlyAlbumsOpen) {
                        return void navigate(constructNavigateParams(true, true, true, true))
                    }
                    return void navigate(constructNavigateParams(false, true, false, false))
                case "artists":
                    if (onlyArtistsOpen) {
                        return void navigate(constructNavigateParams(true, true, true, true))
                    }
                    return void navigate(constructNavigateParams(false, false, true, false))
                case "playlists":
                    if (onlyPlaylistsOpen) {
                        return void navigate(constructNavigateParams(true, true, true, true))
                    }
                    return void navigate(constructNavigateParams(false, false, false, true))
            }
        },
        [tracks, albums, artists, playlists],
    )

    return {
        toggleTopBar,
        toggleSingle,
        isTracksOpen: tracks,
        isAlbumsOpen: albums,
        isArtistsOpen: artists,
        isPlaylistsOpen: playlists,
        onlyTracksOpen,
        onlyAlbumsOpen,
        onlyArtistsOpen,
        onlyPlaylistsOpen,
    }
}
