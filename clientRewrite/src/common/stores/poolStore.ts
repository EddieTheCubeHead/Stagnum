import { create } from "zustand"
import { Pool } from "../models/Pool"

export interface PoolStore {
    pool: Pool | null
    setPool: (pool: Pool) => void
    clearPool: () => void

    confirmingOverwrite: string
    setConfirmingOverwrite: (confirming: string) => void

    deletingPool: boolean
    setDeletingPool: (deletingPool: boolean) => void
}

export const usePoolStore = create<PoolStore>((set) => ({
    pool: null,
    setPool: (pool: Pool) => set({ pool }),
    clearPool: () => set({ pool: null }),

    confirmingOverwrite: "",
    setConfirmingOverwrite: (confirmingOverwrite: string) => set({ confirmingOverwrite }),

    deletingPool: false,
    setDeletingPool: (deletingPool: boolean) => set({ deletingPool }),
}))
