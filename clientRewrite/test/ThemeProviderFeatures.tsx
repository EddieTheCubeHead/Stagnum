import { describe, expect, it, vi } from "vitest"
import { App } from "../src/App"
import { render, screen } from "@testing-library/react"
import { ThemeProvider } from "../src/ThemeProvider"

describe("ThemeProvider", () => {
    it("Should include theme in classname and default to dark theme", () => {
        render(<ThemeProvider>component under test</ThemeProvider>)

        expect(screen.getByText("component under test").className).toContain("dark")
    })

    it.each(["dark", "light"])("Should get theme from browser theme: %s", (theme) => {
        const isDarkTheme = theme === "dark"

        Object.defineProperty(window, "matchMedia", {
            writable: true,
            value: vi.fn().mockImplementation((query) => ({
                matches: isDarkTheme,
                media: query,
                onchange: null,
                addListener: vi.fn(), // Deprecated
                removeListener: vi.fn(), // Deprecated
                addEventListener: vi.fn(),
                removeEventListener: vi.fn(),
                dispatchEvent: vi.fn(),
            })),
        })

        render(<ThemeProvider>component under test</ThemeProvider>)

        expect(screen.getByText("component under test").className).toStrictEqual(expect.stringContaining(theme))
    })
})
