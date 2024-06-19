import { create } from "zustand"
import { createJSONStorage, persist } from "zustand/middleware"

type TokenStore = {
    token: string | null
    setToken: (token: string | null) => void
}

export const useTokenStore = create<TokenStore>()(
    persist(
        (set) => ({
            token: null,
            setToken: (token: string | null) => set({ token: token }),
        }),
        {
            name: "token-storage",
            storage: createJSONStorage(() => localStorage),
        },
    ),
)
