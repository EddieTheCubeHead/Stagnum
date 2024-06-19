import { describe, expect, it } from "vitest"
import { useTokenStore } from "../../../src/common/stores/tokenStore"
import { render, screen } from "@testing-library/react"
import { TestQueryProvider } from "../../utils/TestQueryProvider"
import { EnsureLoginWrapper } from "../../../src/common/components/EnsureLoginWrapper"

describe("EnsureLoginWrapper", () => {
    it("Should open login popup if no token data", () => {
        useTokenStore.setState({ token: null })
        render(
            <TestQueryProvider>
                <EnsureLoginWrapper />
            </TestQueryProvider>,
        )

        expect(screen.getByText("Login")).toBeDefined()
    })

    it("Should not open login popup if token data is set", () => {
        useTokenStore.setState({ token: "my_test_token_1234" })
        render(
            <TestQueryProvider>
                <EnsureLoginWrapper />
            </TestQueryProvider>,
        )

        expect(screen.queryByText("Login")).toBeNull()
    })
})
