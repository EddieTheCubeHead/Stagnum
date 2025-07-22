import { afterEach, describe, expect, it, vi } from "vitest"
import { TopBar } from "../../../src/common/components/TopBar"
import { renderHook, screen } from "@testing-library/react"
import { TestQueryProvider } from "../../utils/TestQueryProvider"
import { mockAxiosGet } from "../../utils/mockAxios"
import { testComponent } from "../../utils/testComponent.tsx"
import { mockLoginState } from "../../utils/mockLoginState.ts"
import { useTokenQuery } from "../../../src/common/hooks/useTokenQuery.ts"
import { QueryClient, useQueryClient } from "@tanstack/react-query"
import { TOKEN } from "../../../src/common/constants/queryKey.ts"
import { ReactNode, useEffect } from "react"

describe("Top bar", () => {
    afterEach(() => {
        vi.restoreAllMocks()
    })

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
            const client = useQueryClient()
            useEffect(() => {
                client.setQueryData([TOKEN], { access_token: "test_token" })
            }, [])
            const token = useTokenQuery().token
            return <>{token}</>
        }

        mockAxiosGet({ display_name: "Test", icon_url: "test.icon.png", spotify_id: "1234" })
        const queryClient = new QueryClient({
            defaultOptions: {
                queries: {
                    retry: false,
                },
            },
        })
        const wrapper = ({ children }: { children: ReactNode }) => (
            <TestQueryProvider client={queryClient}>{children}</TestQueryProvider>
        )
        const { user } = testComponent(
            <TestQueryProvider client={queryClient}>
                <TokenSetter />
                <TopBar />
            </TestQueryProvider>,
        )

        await user.click(screen.getByRole("button"))
        await user.click(screen.getByRole("button", { name: "Log out" }))
        expect(renderHook(() => useTokenQuery(), { wrapper }).result.current.token).toBe(undefined)
    })
})
