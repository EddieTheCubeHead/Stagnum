import { describe, expect, it, vi } from "vitest"
import { render, screen } from "@testing-library/react"
import { ThemeProvider } from "../src/ThemeProvider"
import { Theme, useThemeStore } from "../src/common/stores/themeStore"

describe("ThemeProvider", () => {
    it("Should include theme in classname", () => {
        render(<ThemeProvider>component under test</ThemeProvider>)

        expect(screen.getByText("component under test").className).toContain(Theme.Dark)
    })

    it.each([Theme.Dark, Theme.Light])("Should get theme from theme store", (theme) => {
        useThemeStore.setState({ theme: theme })

        render(<ThemeProvider>component under test</ThemeProvider>)

        expect(screen.getByText("component under test").className).toContain(theme)
    })
})
