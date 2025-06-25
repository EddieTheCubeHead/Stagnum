import { useThemeStore } from "./common/stores/themeStore.ts"
import { ReactNode } from "react"

export const ThemeProvider = ({ children }: { children?: ReactNode }) => {
    const theme = useThemeStore().theme
    return <div className={`theme-${theme}`}>{children}</div>
}
