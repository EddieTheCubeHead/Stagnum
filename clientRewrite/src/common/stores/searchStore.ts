import { create } from "zustand"

type SearchStore = {
    isOpened: boolean
    setIsOpened: (isOpened: boolean) => void
}

export const useSearchStore = create<SearchStore>((set) => ({
    isOpened: false,
    setIsOpened: (isOpened: boolean) => set({ isOpened }),
}))
