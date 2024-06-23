import { create } from "zustand"

type SearchStore = {
    isOpened: boolean
    setIsOpened: (isOpened: boolean) => void

    isTracksOpened: boolean
    setIsTracksOpened: (isTracksOpened: boolean) => void
    isAlbumsOpened: boolean
    setIsAlbumsOpened: (isAlbumsOpened: boolean) => void
    isArtistsOpened: boolean
    setIsArtistsOpened: (isArtistsOpened: boolean) => void
    isPlaylistOpened: boolean
    setIsPlaylistOpened: (isPlaylistOpened: boolean) => void

    query: string
    setQuery: (query: string) => void
}

export const useSearchStore = create<SearchStore>((set) => ({
    isOpened: false,
    setIsOpened: (isOpened: boolean) => set({ isOpened }),

    query: "",
    setQuery: (query: string) => set({ query }),

    isTracksOpened: true,
    setIsTracksOpened: (isTracksOpened: boolean) => set({ isTracksOpened }),
    isAlbumsOpened: true,
    setIsAlbumsOpened: (isAlbumsOpened: boolean) => set({ isAlbumsOpened }),
    isArtistsOpened: true,
    setIsArtistsOpened: (isArtistsOpened: boolean) => set({ isArtistsOpened }),
    isPlaylistOpened: true,
    setIsPlaylistOpened: (isPlaylistOpened: boolean) => set({ isPlaylistOpened }),
}))
