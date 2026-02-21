import { describe, expect, it } from "vitest"
import { screen } from "@testing-library/react"
import { ThemeProvider } from "../src/ThemeProvider"
import { Theme, useThemeStore } from "../src/common/stores/themeStore"
import { testComponent } from "./utils/testComponent.tsx"

describe("ThemeProvider", () => {
    it("Should include theme in classname", () => {
        testComponent(<ThemeProvider>component under test</ThemeProvider>)

        expect(screen.getByText("component under test").className).toContain(Theme.Dark)
    })

    it.each([Theme.Dark, Theme.Light])("Should get theme from theme store", (theme) => {
        useThemeStore.setState({ theme: theme })

        testComponent(<ThemeProvider>component under test</ThemeProvider>)

        expect(screen.getByText("component under test").className).toContain(theme)
    })
})
