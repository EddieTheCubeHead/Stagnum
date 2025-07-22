import { useCallback, useMemo, useReducer } from "react"
import { SearchOpenedFields } from "../models/SearchOpenedFields.ts"

export type toggledCategory = "tracks" | "albums" | "artists" | "playlists"
type actionType = "toggle" | "toggleFocus"
interface ToggleAction {
    category: toggledCategory
    actionType: actionType
}

const hasTrackFocus = ({ tracks, albums, artists, playlists }: SearchOpenedFields) => {
    return tracks && !albums && !artists && !playlists
}

const hasAlbumFocus = ({ tracks, albums, artists, playlists }: SearchOpenedFields) => {
    return !tracks && albums && !artists && !playlists
}

const hasArtistFocus = ({ tracks, albums, artists, playlists }: SearchOpenedFields) => {
    return !tracks && !albums && artists && !playlists
}

const hasPlaylistFocus = ({ tracks, albums, artists, playlists }: SearchOpenedFields) => {
    return !tracks && !albums && !artists && playlists
}

export const useSearchStates = () => {
    const reducer = useCallback(
        (state: SearchOpenedFields, { category, actionType }: ToggleAction): SearchOpenedFields => {
            switch (actionType) {
                case "toggle":
                    const { tracks, albums, artists, playlists } = state
                    return {
                        tracks: (category === "tracks") !== tracks,
                        albums: (category === "albums") !== albums,
                        artists: (category === "artists") !== artists,
                        playlists: (category === "playlists") !== playlists,
                    }
                case "toggleFocus":
                    switch (category) {
                        case "tracks":
                            if (hasTrackFocus(state)) {
                                return { tracks: true, albums: true, artists: true, playlists: true }
                            }
                            return { tracks: true, albums: false, artists: false, playlists: false }
                        case "albums":
                            if (hasAlbumFocus(state)) {
                                return { tracks: true, albums: true, artists: true, playlists: true }
                            }
                            return { tracks: false, albums: true, artists: false, playlists: false }
                        case "artists":
                            if (hasArtistFocus(state)) {
                                return { tracks: true, albums: true, artists: true, playlists: true }
                            }
                            return { tracks: false, albums: false, artists: true, playlists: false }
                        case "playlists":
                            if (hasPlaylistFocus(state)) {
                                return { tracks: true, albums: true, artists: true, playlists: true }
                            }
                            return { tracks: false, albums: false, artists: false, playlists: true }
                    }
            }
        },
        [],
    )
    const [state, dispatch] = useReducer(reducer, {
        tracks: true,
        albums: true,
        artists: true,
        playlists: true,
    })

    const isTracksFocused = useMemo(() => hasTrackFocus(state), [state])
    const isAlbumsFocused = useMemo(() => hasAlbumFocus(state), [state])
    const isArtistsFocused = useMemo(() => hasArtistFocus(state), [state])
    const isPlaylistsFocused = useMemo(() => hasPlaylistFocus(state), [state])

    const toggleCategory = (category: toggledCategory) => dispatch({ category, actionType: "toggle" })
    const toggleFocus = (category: toggledCategory) => dispatch({ category, actionType: "toggleFocus" })

    return {
        ...state,
        isTracksFocused,
        isAlbumsFocused,
        isArtistsFocused,
        isPlaylistsFocused,
        toggleCategory,
        toggleFocus,
    }
}
