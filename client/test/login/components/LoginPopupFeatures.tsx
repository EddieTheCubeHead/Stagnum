import { describe, expect, it } from "vitest"
import { screen } from "@testing-library/react"
import { LoginPopup } from "../../../src/login/components/loginPopup/LoginPopup"
import { Theme, useThemeStore } from "../../../src/common/stores/themeStore"
import { TestQueryProvider } from "../../utils/TestQueryProvider"
import { testComponent } from "../../utils/testComponent.tsx"

describe("LoginPopup", () => {
    it("Should display stagnum logo", () => {
        testComponent(
            <TestQueryProvider>
                <LoginPopup />
            </TestQueryProvider>,
        )

        expect(screen.getByText("Stagnum")).toBeVisible()
    })

    it("Should prompt the user to use Spotify for logging in", () => {
        testComponent(
            <TestQueryProvider>
                <LoginPopup />
            </TestQueryProvider>,
        )

        expect(screen.getByText("Please log in with your Spotify account")).toBeVisible()
    })

    it.each([Theme.Dark, Theme.Light])(
        "Should render appropriate image if screen is wide enough, theme: %s",
        (theme) => {
            useThemeStore.setState({ theme: theme })
            testComponent(
                <TestQueryProvider>
                    <LoginPopup />
                </TestQueryProvider>,
            )

            expect(
                screen.getByAltText(`${theme.charAt(0).toUpperCase() + theme.slice(1)} theme login background image`),
            ).toBeVisible()
        },
    )

    it("Should display login button", () => {
        testComponent(
            <TestQueryProvider>
                <LoginPopup />
            </TestQueryProvider>,
        )

        expect(screen.getByRole("button", { name: "Login" })).toBeVisible()
    })
})
