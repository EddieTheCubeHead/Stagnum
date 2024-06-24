import { create } from "zustand"

export type SearchStore = {
    isOpened: boolean
    setIsOpened: (isOpened: boolean) => void

    isTracksOpened: boolean
    setIsTracksOpened: (isTracksOpened: boolean) => void
    focusTracks: () => void
    isAlbumsOpened: boolean
    setIsAlbumsOpened: (isAlbumsOpened: boolean) => void
    focusAlbums: () => void
    isArtistsOpened: boolean
    setIsArtistsOpened: (isArtistsOpened: boolean) => void
    focusArtists: () => void
    isPlaylistOpened: boolean
    setIsPlaylistOpened: (isPlaylistOpened: boolean) => void
    focusPlaylists: () => void
    openAll: () => void

    query: string
    setQuery: (query: string) => void
    clearQuery: () => void
}

export const useSearchStore = create<SearchStore>((set) => ({
    isOpened: false,
    setIsOpened: (isOpened: boolean) => set({ isOpened }),

    query: "",
    setQuery: (query: string) => {
        if (query === "") {
            return
        }
        set({ query })
    },
    clearQuery: () => set({ query: "" }),

    isTracksOpened: true,
    setIsTracksOpened: (isTracksOpened: boolean) => set({ isTracksOpened }),
    focusTracks: () => {
        set({ isTracksOpened: true })
        set({ isAlbumsOpened: false })
        set({ isArtistsOpened: false })
        set({ isPlaylistOpened: false })
    },

    isAlbumsOpened: true,
    setIsAlbumsOpened: (isAlbumsOpened: boolean) => set({ isAlbumsOpened }),
    focusAlbums: () => {
        set({ isTracksOpened: false })
        set({ isAlbumsOpened: true })
        set({ isArtistsOpened: false })
        set({ isPlaylistOpened: false })
    },

    isArtistsOpened: true,
    setIsArtistsOpened: (isArtistsOpened: boolean) => set({ isArtistsOpened }),
    focusArtists: () => {
        set({ isTracksOpened: false })
        set({ isAlbumsOpened: false })
        set({ isArtistsOpened: true })
        set({ isPlaylistOpened: false })
    },

    isPlaylistOpened: true,
    setIsPlaylistOpened: (isPlaylistOpened: boolean) => set({ isPlaylistOpened }),
    focusPlaylists: () => {
        set({ isTracksOpened: false })
        set({ isAlbumsOpened: false })
        set({ isArtistsOpened: false })
        set({ isPlaylistOpened: true })
    },

    openAll: () => {
        set({ isTracksOpened: true })
        set({ isAlbumsOpened: true })
        set({ isArtistsOpened: true })
        set({ isPlaylistOpened: true })
    },
}))
