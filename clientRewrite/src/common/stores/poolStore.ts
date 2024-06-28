import { create } from "zustand"
import { Pool } from "../models/Pool"
import { PlayableSpotifyResource } from "../../search/models/PlayableSpotifyResource.ts"

export interface PoolStore {
    pool: Pool | null
    setPool: (pool: Pool) => void
    clearPool: () => void

    confirmingOverwrite: PlayableSpotifyResource | null
    setConfirmingOverwrite: (confirming: PlayableSpotifyResource | null) => void

    deletingPool: boolean
    setDeletingPool: (deletingPool: boolean) => void
}

export const usePoolStore = create<PoolStore>((set) => ({
    pool: null,
    setPool: (pool: Pool) => set({ pool }),
    clearPool: () => set({ pool: null }),

    confirmingOverwrite: null,
    setConfirmingOverwrite: (confirmingOverwrite: PlayableSpotifyResource | null) => set({ confirmingOverwrite }),

    deletingPool: false,
    setDeletingPool: (deletingPool: boolean) => set({ deletingPool }),
}))
