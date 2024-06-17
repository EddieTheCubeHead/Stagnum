import { describe, it, expect } from "vitest"
import { useTokenStore } from "../../src/common/stores/tokenStore"
import { Home } from "../../src/views/Home"
import { render, screen } from "@testing-library/react"
import { TestQueryProvider } from "../utils/TestQueryProvider"

describe("Home", () => {
    it("Should open login popup if no token data", () => {
        useTokenStore.setState({ token: null })
        render(
            <TestQueryProvider>
                <Home />
            </TestQueryProvider>,
        )

        expect(screen.getByText("Login")).toBeDefined()
    })

    it("Should not open login popup if token data is set", () => {
        useTokenStore.setState({ token: "my_test_token_1234" })
        render(
            <TestQueryProvider>
                <Home />
            </TestQueryProvider>,
        )

        expect(screen.queryByText("Login")).toBeNull()
    })
})
