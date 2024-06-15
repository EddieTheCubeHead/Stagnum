import { useThemeStore } from "./common/stores/themeStore.ts"

export const ThemeProvider = ({ children }: { children?: React.ReactNode }) => {
    const theme = useThemeStore().theme
    return <div className={`theme-${theme}`}>{children}</div>
}
