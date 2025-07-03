import { describe, expect, it, vi } from "vitest"
import { TopBar } from "../../../src/common/components/TopBar"
import { renderHook, screen } from "@testing-library/react"
import { TestQueryProvider } from "../../utils/TestQueryProvider"
import { mockAxiosGet } from "../../utils/mockAxios"
import testComponent from "../../utils/testComponent.tsx"
import { mockLoginState } from "../../utils/mockLoginState.ts"
import { useTokenQuery } from "../../../src/common/hooks/useTokenQuery.ts"
import * as tanstackQuery from "@tanstack/react-query"
import { QueryClient, useQueryClient } from "@tanstack/react-query"
import { ReactNode } from "react"
import { TOKEN } from "../../../src/common/constants/queryKey.ts"

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
        mockLoginState()
        mockAxiosGet({ display_name: "Test", icon_url: null, spotify_id: "1234" })
        testComponent(
            <TestQueryProvider>
                <TopBar />
            </TestQueryProvider>,
        )

        expect(screen.findByText("T")).toBeDefined()
    })

    it("Should render user icon if available", () => {
        mockLoginState()
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
        mockLoginState()
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
        const TokenSetter = () => {
            const { setQueryData } = useQueryClient()
            setQueryData([TOKEN], "test_token")
            return <></>
        }
        mockAxiosGet({ display_name: "Test", icon_url: "test.icon.png", spotify_id: "1234" })
        const { user } = testComponent(
            <TestQueryProvider>
                <TokenSetter />
                <TopBar />
            </TestQueryProvider>,
        )

        await user.click(screen.getByRole("button"))
        await user.click(await screen.findByRole("button", { name: "Log out" }))

        expect(useTokenQuery().token).toBe(undefined)
    })
})
