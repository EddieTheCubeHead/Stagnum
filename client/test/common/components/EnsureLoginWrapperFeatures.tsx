import { describe, expect, it } from "vitest"
import { screen } from "@testing-library/react"
import { TestQueryProvider } from "../../utils/TestQueryProvider"
import { EnsureLoginWrapper } from "../../../src/common/components/EnsureLoginWrapper"
import testComponent from "../../utils/testComponent.tsx"
import { mockLoginState } from "../../utils/mockLoginState.ts"

describe("EnsureLoginWrapper", () => {
    it("Should open login popup if no token data", () => {
        testComponent(
            <TestQueryProvider>
                <EnsureLoginWrapper />
            </TestQueryProvider>,
        )

        expect(screen.getByText("Login")).toBeDefined()
    })

    it("Should not open login popup if token data is set", () => {
        mockLoginState()
        testComponent(
            <TestQueryProvider>
                <EnsureLoginWrapper />
            </TestQueryProvider>,
        )

        expect(screen.queryByText("Login")).toBeNull()
    })
})
