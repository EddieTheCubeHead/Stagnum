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
