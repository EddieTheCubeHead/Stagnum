import { describe, expect, it, vi } from "vitest"
import { render, screen } from "@testing-library/react"
import { ThemeProvider } from "../src/ThemeProvider"

function mockTheme(isLightTheme: boolean) {
    Object.defineProperty(window, "matchMedia", {
        writable: true,
        value: vi.fn().mockImplementation((query) => ({
            matches: isLightTheme,
            media: query,
            addEventListener: vi.fn(),
        })),
    })
}

describe("ThemeProvider", () => {
    it("Should include theme in classname", () => {
        mockTheme(true)
        render(<ThemeProvider>component under test</ThemeProvider>)

        expect(screen.getByText("component under test").className).toContain("light")
    })

    it.each(["dark", "light"])("Should get theme from browser theme: %s", (theme) => {
        const isLightTheme = theme === "light"

        mockTheme(isLightTheme)

        render(<ThemeProvider>component under test</ThemeProvider>)

        expect(screen.getByText("component under test").className).toContain(theme)
    })
})
