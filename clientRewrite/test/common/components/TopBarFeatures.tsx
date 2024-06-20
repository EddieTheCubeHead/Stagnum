import { describe, expect, it, vi } from "vitest"
import { TopBar } from "../../../src/common/components/TopBar"
import { render, screen } from "@testing-library/react"
import { TestQueryProvider } from "../../utils/TestQueryProvider"
import { mockAxiosGet } from "../../utils/mockAxios"
import { useTokenStore } from "../../../src/common/stores/tokenStore"

describe("Top bar", () => {
    it("Should render app name", () => {
        render(
            <TestQueryProvider>
                <TopBar />
            </TestQueryProvider>,
        )

        expect(screen.getByText("Stagnum")).toBeDefined()
    })

    it("Should render question in place of username initial placeholder if no user data", () => {
        render(
            <TestQueryProvider>
                <TopBar />
            </TestQueryProvider>,
        )

        expect(screen.getByText("?")).toBeDefined()
    })

    // @ts-expect-error
    it("Should render username first letter if image missing", async () => {
        useTokenStore.setState({ token: "my_test_token_1234" })
        mockAxiosGet({ display_name: "Test", icon_url: null, spotify_id: "1234" })
        render(
            <TestQueryProvider>
                <TopBar />
            </TestQueryProvider>,
        )

        // @ts-expect-error
        await new Promise((r: TimerHandler) => setTimeout(r, 50))
        expect(screen.getByText("T")).toBeDefined()
    })

    // @ts-expect-error
    it("Should render use icon if available", async () => {
        useTokenStore.setState({ token: "my_test_token_1234" })
        mockAxiosGet({ display_name: "Test", icon_url: "test.icon.png", spotify_id: "1234" })
        render(
            <TestQueryProvider>
                <TopBar />
            </TestQueryProvider>,
        )

        // @ts-expect-error
        await new Promise((r: TimerHandler) => setTimeout(r, 50))
        expect(screen.queryByText("T")).toBeNull()
        expect(screen.getByAltText("User Test avatar")).toBeDefined()
    })
})
