import { expect, it, describe, vi } from "vitest"
import { act, render, screen } from "@testing-library/react"
import { TestQueryProvider } from "../utils/TestQueryProvider"
import { useTokenStore } from "../../src/common/stores/tokenStore"
import axios from "axios"
import { Main } from "../../src/views/Main"
import { Home } from "../../src/views/Home"

const mockQueryParamCodeAndState = (testCode: string, testState: string) => {
    let queryParams = vi.spyOn(window, "location", "get")
    // @ts-ignore
    queryParams.mockReturnValueOnce({ search: `code=${testCode}&state=${testState}` })
}

const mockAxiosGet = (data: any) => {
    const axiosMock = vi.spyOn(axios, "get")

    axiosMock.mockResolvedValue({ data: data })
}

describe("Main", () => {
    it("Should open login popup if no token data", () => {
        useTokenStore.setState({ token: null })
        render(
            <TestQueryProvider>
                <Main />
            </TestQueryProvider>,
        )

        expect(screen.getByText("Login")).toBeDefined()
    })

    it("Should not open login popup if token data is set", () => {
        useTokenStore.setState({ token: "my_test_token_1234" })
        render(
            <TestQueryProvider>
                <Main />
            </TestQueryProvider>,
        )

        expect(screen.queryByText("Login")).toBeNull()
    })

    it(
        "Should fetch login callback if code and state in url parameters",
        // @ts-expect-error
        new Promise((done: () => void) => {
            const testCode = "my_test_code"
            const testState = "my_test_state"
            mockQueryParamCodeAndState(testCode, testState)
            const accessToken = "my_access_token_1234"
            const tokenData = { access_token: accessToken }
            mockAxiosGet(tokenData)

            render(
                <TestQueryProvider>
                    <Main />
                </TestQueryProvider>,
            )
            done()
            expect(useTokenStore.getState().token).toEqual(accessToken)
        }),
    )
})
