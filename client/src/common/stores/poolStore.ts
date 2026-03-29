import { create } from "zustand"
import { Pool } from "../models/Pool"
import { PlayableSpotifyResource } from "../../search/models/PlayableSpotifyResource.ts"
import { PoolTrack } from "../models/PoolTrack.ts"

export const enum PoolState {
    Normal,
    Deleting,
    Leaving,
}

export interface PoolStore {
    pool: Pool | null
    setPool: (pool: Pool | null) => void
    setPlaybackState: (poolMember: PoolTrack) => void
    clearPool: () => void

    confirmingOverwrite: PlayableSpotifyResource | null
    setConfirmingOverwrite: (confirming: PlayableSpotifyResource | null) => void

    poolState: PoolState
    setPoolState: (poolState: PoolState) => void
    clearPoolState: () => void
}

export const usePoolStore = create<PoolStore>((set) => ({
    pool: null,
    setPool: (pool: Pool | null) => set({ pool }),
    setPlaybackState: (poolMember: PoolTrack) => {
        set((state) => ({
            pool: state.pool
                ? {
                      ...state.pool,
                      currently_playing: poolMember,
                      users: state.pool.users.map((poolUser) => ({
                          ...poolUser,
                          user: {
                              ...poolUser.user,
                              promoted_track_id:
                                  poolUser.user.promoted_track_id === poolMember.id
                                      ? undefined
                                      : poolUser.user.promoted_track_id,
                          },
                      })),
                  }
                : null,
        }))
    },
    clearPool: () => set({ pool: null }),

    confirmingOverwrite: null,
    setConfirmingOverwrite: (confirmingOverwrite: PlayableSpotifyResource | null) => set({ confirmingOverwrite }),

    poolState: PoolState.Normal,
    setPoolState: (poolState: PoolState) => set({ poolState }),
    clearPoolState: () => set({ poolState: PoolState.Normal }),
}))
