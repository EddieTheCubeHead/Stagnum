import { expect, it, describe, vi, beforeEach } from "vitest"
import { act, render, screen } from "@testing-library/react"
import { TestQueryProvider } from "../../utils/TestQueryProvider"
import { useTokenStore } from "../../../src/common/stores/tokenStore"
import { Main } from "../../../src/common/views/Main"
import { mockAxiosDelete, mockAxiosGet } from "../../utils/mockAxios"
import { useSearchStore } from "../../../src/common/stores/searchStore"
import { usePoolStore } from "../../../src/common/stores/poolStore"
import { mockedTrackPoolData } from "../../search/data/mockPoolData"
import { userEvent } from "@testing-library/user-event"

const mockQueryParamCodeAndState = (testCode: string, testState: string) => {
    let queryParams = vi.spyOn(window, "location", "get")
    // @ts-ignore
    queryParams.mockReturnValueOnce({ search: `code=${testCode}&state=${testState}` })
}

describe("Main", () => {
    // @ts-expect-error
    it("Should fetch login callback if code and state in url parameters", async () => {
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

        // @ts-expect-error
        await new Promise((r: TimerHandler) => setTimeout(r))
        expect(useTokenStore.getState().token).toEqual(accessToken)
    })

    describe("Pool deletion operations", () => {
        const user = userEvent.setup()

        beforeEach(() => {
            useSearchStore.setState({ isOpened: false })
            useTokenStore.setState({ token: "my_test_token_1234" })
            usePoolStore.setState({ pool: mockedTrackPoolData(), deletingPool: false, confirmingOverwrite: "" })
        })

        it("Should prompt whether user wants to delete the pool when clicking delete pool", () => {
            render(
                <TestQueryProvider>
                    <Main />
                </TestQueryProvider>,
            )

            act(() => screen.getByRole("button", { name: "Delete pool" }).click())

            expect(screen.getByRole("heading", { name: "Warning!" })).toBeDefined()
            expect(
                screen.getByText(
                    "You are about to delete your current playback pool! This cannot be reversed. Do you wish to continue?",
                ),
            ).toBeDefined()
            expect(screen.getByRole("button", { name: "Cancel" })).toBeDefined()
            expect(screen.getByRole("button", { name: "Continue" })).toBeDefined()
        })

        // @ts-expect-error
        it("Should not delete pool if cancelling on pool delete modal", async () => {
            render(
                <TestQueryProvider>
                    <Main />
                </TestQueryProvider>,
            )

            await user.click(screen.getByRole("button", { name: "Delete pool" }))
            await user.click(screen.getByRole("button", { name: "Cancel" }))

            expect(screen.getByText(mockedTrackPoolData().users[0].tracks[0].name)).toBeDefined()
            expect(usePoolStore.getState().pool).toBeDefined()
        })

        // @ts-expect-error
        it("Should delete pool if continuing on pool delete modal", async () => {
            mockAxiosDelete(null)
            render(
                <TestQueryProvider>
                    <Main />
                </TestQueryProvider>,
            )

            await user.click(screen.getByRole("button", { name: "Delete pool" }))
            await user.click(screen.getByRole("button", { name: "Continue" }))

            // @ts-expect-error
            await new Promise((r: TimerHandler) => setTimeout(r, 50))

            expect(screen.queryByText(mockedTrackPoolData().users[0].tracks[0].name)).toBeNull()
            expect(usePoolStore.getState().pool).toBeNull()
        })
    })
})
