import { describe, expect, it, vi } from "vitest"
import { TopBar } from "../../../src/common/components/TopBar"
import { act, render, screen } from "@testing-library/react"
import { TestQueryProvider } from "../../utils/TestQueryProvider"
import { mockAxiosGet } from "../../utils/mockAxios"
import { useTokenStore } from "../../../src/common/stores/tokenStore"
import { userEvent } from "@testing-library/user-event"

describe("Top bar", () => {
    it("Should render app name", () => {
        render(
            <TestQueryProvider>
                <TopBar />
            </TestQueryProvider>,
        )

        expect(screen.getByText("Stagnum")).toBeDefined()
    })

    it("Should render username first letter if image missing", () => {
        useTokenStore.setState({ token: "my_test_token_1234" })
        mockAxiosGet({ display_name: "Test", icon_url: null, spotify_id: "1234" })
        render(
            <TestQueryProvider>
                <TopBar />
            </TestQueryProvider>,
        )

        expect(screen.findByText("T")).toBeDefined()
    })

    it("Should render use icon if available", () => {
        useTokenStore.setState({ token: "my_test_token_1234" })
        mockAxiosGet({ display_name: "Test", icon_url: "test.icon.png", spotify_id: "1234" })
        render(
            <TestQueryProvider>
                <TopBar />
            </TestQueryProvider>,
        )

        expect(screen.findByAltText("User Test avatar")).toBeDefined()
        expect(screen.queryByText("T")).toBeNull()
    })

    it("Should render user settings when clicking on top bar avatar", () => {
        const user = userEvent.setup()
        useTokenStore.setState({ token: "my_test_token_1234" })
        mockAxiosGet({ display_name: "Test", icon_url: "test.icon.png", spotify_id: "1234" })
        render(
            <TestQueryProvider>
                <TopBar />
            </TestQueryProvider>,
        )

        user.click(screen.getByRole("button"))

        expect(screen.findByRole("button", { name: "Log out" })).toBeDefined()
    })

    // @ts-ignore
    it("Should set token to null after clicking log out", async () => {
        const user = userEvent.setup()
        useTokenStore.setState({ token: "my_test_token_1234" })
        mockAxiosGet({ display_name: "Test", icon_url: "test.icon.png", spotify_id: "1234" })
        render(
            <TestQueryProvider>
                <TopBar />
            </TestQueryProvider>,
        )

        await user.click(screen.getByRole("button"))
        await user.click(await screen.findByRole("button", { name: "Log out" }))

        expect(useTokenStore.getState().token).toBeNull()
    })
})
