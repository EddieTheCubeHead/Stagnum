import { create } from "zustand"

export const enum Theme {
    Dark = "dark",
    Light = "light",
}

type ThemeStore = {
    theme: Theme
    setTheme: (theme: Theme) => void
}

export const useThemeStore = create<ThemeStore>((set) => ({
    theme: !window.matchMedia || window.matchMedia("(prefers-color-scheme: dark)").matches ? Theme.Dark : Theme.Light,
    setTheme: (newTheme: Theme) => set({ theme: newTheme }),
}))
