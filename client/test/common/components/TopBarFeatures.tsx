import { describe, expect, it } from "vitest"
import { TopBar } from "../../../src/common/components/TopBar"
import { screen } from "@testing-library/react"
import { TestQueryProvider } from "../../utils/TestQueryProvider"
import { mockAxiosGet } from "../../utils/mockAxios"
import { useTokenStore } from "../../../src/common/stores/tokenStore"
import testComponent from "../../utils/testComponent.tsx"

describe("Top bar", () => {
    it("Should render app name", () => {
        testComponent(
            <TestQueryProvider>
                <TopBar />
            </TestQueryProvider>,
        )

        expect(screen.getByText("Stagnum")).toBeDefined()
    })

    it("Should render username first letter if image missing", () => {
        useTokenStore.setState({ token: "my_test_token_1234" })
        mockAxiosGet({ display_name: "Test", icon_url: null, spotify_id: "1234" })
        testComponent(
            <TestQueryProvider>
                <TopBar />
            </TestQueryProvider>,
        )

        expect(screen.findByText("T")).toBeDefined()
    })

    it("Should render user icon if available", () => {
        useTokenStore.setState({ token: "my_test_token_1234" })
        mockAxiosGet({ display_name: "Test", icon_url: "test.icon.png", spotify_id: "1234" })
        testComponent(
            <TestQueryProvider>
                <TopBar />
            </TestQueryProvider>,
        )

        expect(screen.findByAltText("User Test avatar")).toBeDefined()
        expect(screen.queryByText("T")).toBeNull()
    })

    it("Should render user settings when clicking on top bar avatar", async () => {
        useTokenStore.setState({ token: "my_test_token_1234" })
        mockAxiosGet({ display_name: "Test", icon_url: "test.icon.png", spotify_id: "1234" })
        const { user } = testComponent(
            <TestQueryProvider>
                <TopBar />
            </TestQueryProvider>,
        )

        await user.click(screen.getByRole("button"))

        expect(screen.getByRole("button", { name: "Log out" })).toBeDefined()
    })

    it("Should set token to null after clicking log out", async () => {
        useTokenStore.setState({ token: "my_test_token_1234" })
        mockAxiosGet({ display_name: "Test", icon_url: "test.icon.png", spotify_id: "1234" })
        const { user } = testComponent(
            <TestQueryProvider>
                <TopBar />
            </TestQueryProvider>,
        )

        await user.click(screen.getByRole("button"))
        await user.click(await screen.findByRole("button", { name: "Log out" }))

        expect(useTokenStore.getState().token).toBeNull()
    })
})
