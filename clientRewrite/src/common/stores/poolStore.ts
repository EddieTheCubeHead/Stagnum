import { create } from "zustand"
import { Pool } from "../models/Pool"

export interface PoolStore {
    pool: Pool | null
    setPool: (pool: Pool) => void

    confirmingOverwrite: string
    setConfirmingOverwrite: (confirming: string) => void
}

export const usePoolStore = create<PoolStore>((set) => ({
    pool: null,
    setPool: (pool: Pool) => set({ pool }),

    confirmingOverwrite: "",
    setConfirmingOverwrite: (confirmingOverwrite: string) => set({ confirmingOverwrite }),
}))
