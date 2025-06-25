import { describe, expect, it } from "vitest"
import { render, screen } from "@testing-library/react"
import { LoginPopup } from "../../../src/login/components/loginPopup/LoginPopup"
import { Theme, useThemeStore } from "../../../src/common/stores/themeStore"
import { TestQueryProvider } from "../../utils/TestQueryProvider"

describe("LoginPopup", () => {
    it("Should display stagnum logo", () => {
        render(
            <TestQueryProvider>
                <LoginPopup />
            </TestQueryProvider>,
        )

        expect(screen.getByText("Stagnum")).toBeDefined()
    })

    it("Should prompt the user to use Spotify for logging in", () => {
        render(
            <TestQueryProvider>
                <LoginPopup />
            </TestQueryProvider>,
        )

        expect(screen.getByText("Please log in with your Spotify account")).toBeDefined()
    })

    it.each([Theme.Dark, Theme.Light])("Should render appropriate image if screen is wide enough", (theme) => {
        useThemeStore.setState({ theme: theme })
        render(
            <TestQueryProvider>
                <LoginPopup />
            </TestQueryProvider>,
        )

        expect(
            screen.getByAltText(`${theme.charAt(0).toUpperCase() + theme.slice(1)} theme login background image`),
        ).toBeDefined()
    })

    it("Should display login button", () => {
        render(
            <TestQueryProvider>
                <LoginPopup />
            </TestQueryProvider>,
        )

        expect(screen.getByRole("button", { name: "Login" })).toBeDefined()
    })
})
