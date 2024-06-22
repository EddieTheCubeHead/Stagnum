import { create } from "zustand"

type SearchStore = {
    isOpened: boolean
    setIsOpened: (isOpened: boolean) => void

    query: string
    setQuery: (query: string) => void
}

export const useSearchStore = create<SearchStore>((set) => ({
    isOpened: false,
    setIsOpened: (isOpened: boolean) => set({ isOpened }),
    query: "",
    setQuery: (query: string) => set({ query }),
}))
