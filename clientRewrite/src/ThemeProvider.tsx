import React from "react"

export function ThemeProvider({ children }: { children?: React.ReactNode }) {
    const theme = window.matchMedia && !window.matchMedia("(prefers-color-scheme: dark)").matches ? "light" : "dark"
    return <div className={theme}>{children}</div>
}
