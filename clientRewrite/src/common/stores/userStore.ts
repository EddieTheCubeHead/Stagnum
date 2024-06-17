import { create } from "zustand"

export interface User {
    display_name: string
    icon_url: string | null
    spotify_id: string
}

type UserStore = {
    user: User | null
    setUser: (user: User) => void
}

export const useUserStore = create<UserStore>((set) => ({
    user: null,
    setUser: (newUser: User | null) => set({ user: newUser }),
}))
