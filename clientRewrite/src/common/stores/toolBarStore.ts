import { create } from "zustand"

export const enum ToolBarState {
    Normal,
    Search,
    SharePool,
    JoinPool,
}

type ToolBarStore = {
    state: ToolBarState
    setState: (state: ToolBarState) => void
}

export const useToolBarStore = create<ToolBarStore>((set) => ({
    state: ToolBarState.Normal,
    setState: (newToolBarState: ToolBarState) => set({ state: newToolBarState }),
}))
