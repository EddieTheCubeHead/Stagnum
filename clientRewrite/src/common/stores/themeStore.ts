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
    theme: window.matchMedia && window.matchMedia("(prefers-color-scheme: light)").matches ? Theme.Light : Theme.Dark,
    setTheme: (newTheme: Theme) => set({ theme: newTheme }),
}))
