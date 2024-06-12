import { describe, expect, it, vi } from "vitest"
import { render, screen } from "@testing-library/react"
import { ThemeProvider } from "../src/ThemeProvider"

function mockTheme(isLightTheme: boolean) {
    Object.defineProperty(window, "matchMedia", {
        writable: true,
        value: vi.fn().mockImplementation((query) => ({
            matches: isLightTheme,
            media: query,
            onchange: null,
            addListener: vi.fn(), // Deprecated
            removeListener: vi.fn(), // Deprecated
            addEventListener: vi.fn(),
            removeEventListener: vi.fn(),
            dispatchEvent: vi.fn(),
        })),
    })
}

describe("ThemeProvider", () => {
    it("Should include theme in classname", () => {
        Object.defineProperty(window, "matchMedia", {
            writable: true,
            value: vi.fn().mockImplementation((query) => ({
                matches: true,
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

        expect(screen.getByText("component under test").className).toContain("light")
    })

    it.each(["dark", "light"])("Should get theme from browser theme: %s", (theme) => {
        const isLightTheme = theme === "light"

        mockTheme(isLightTheme)

        render(<ThemeProvider>component under test</ThemeProvider>)

        expect(screen.getByText("component under test").className).toContain(theme)
    })
})
