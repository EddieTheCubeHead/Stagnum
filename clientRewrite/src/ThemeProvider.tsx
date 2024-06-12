import React, { useState } from "react"

export function ThemeProvider({ children }: { children?: React.ReactNode }) {
    const userThemeMatcher = window.matchMedia && window.matchMedia("(prefers-color-scheme: light)")
    // const userTheme = .matches ? "light" : "dark"
    const [theme, setTheme] = useState(userThemeMatcher.matches ? "light" : "dark")
    userThemeMatcher.addEventListener("change", (event) => setTheme(event.matches ? "light" : "dark"))
    return <div className={`theme-${theme}`}>{children}</div>
}
