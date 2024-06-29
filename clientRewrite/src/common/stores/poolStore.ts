import { create } from "zustand"
import { Pool } from "../models/Pool"
import { PlayableSpotifyResource } from "../../search/models/PlayableSpotifyResource.ts"
import { PoolTrack } from "../models/PoolTrack.ts"

export interface PoolStore {
    pool: Pool | null
    setPool: (pool: Pool) => void
    setPlaybackState: (poolMember: PoolTrack) => void
    clearPool: () => void

    confirmingOverwrite: PlayableSpotifyResource | null
    setConfirmingOverwrite: (confirming: PlayableSpotifyResource | null) => void

    deletingPool: boolean
    setDeletingPool: (deletingPool: boolean) => void
}

export const usePoolStore = create<PoolStore>((set) => ({
    pool: null,
    setPool: (pool: Pool) => set({ pool }),
    setPlaybackState: (poolMember: PoolTrack) => {
        set((state) => ({ pool: state.pool ? { ...state.pool, currently_playing: poolMember } : null }))
    },
    clearPool: () => set({ pool: null }),

    confirmingOverwrite: null,
    setConfirmingOverwrite: (confirmingOverwrite: PlayableSpotifyResource | null) => set({ confirmingOverwrite }),

    deletingPool: false,
    setDeletingPool: (deletingPool: boolean) => set({ deletingPool }),
}))
