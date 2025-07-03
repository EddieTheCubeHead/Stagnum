import { expect, it, describe, vi, beforeEach } from "vitest"
import { act, screen } from "@testing-library/react"
import { TestQueryProvider } from "../../utils/TestQueryProvider"
import { Main } from "../../../src/common/views/Main"
import { mockAxiosDelete, mockAxiosPost, mockMultipleGets } from "../../utils/mockAxios"
import { useSearchStore } from "../../../src/common/stores/searchStore"
import { PoolState, usePoolStore } from "../../../src/common/stores/poolStore"
import { mockedTrackPoolData } from "../../search/data/mockPoolData"
import { useAlertStore } from "../../../src/alertSystem/alertStore"
import testComponent from "../../utils/testComponent.tsx"
import { AxiosError } from "axios"
import { useTokenQuery } from "../../../src/common/hooks/useTokenQuery.ts"
import { mockLoginState } from "../../utils/mockLoginState.ts"

const mockQueryParamCodeAndState = (testCode: string, testState: string) => {
    let queryParams = vi.spyOn(window, "location", "get")
    // @ts-ignore
    queryParams.mockReturnValueOnce({ search: `code=${testCode}&state=${testState}` })
}

describe("Main", () => {
    it("Should fetch login callback if code and state in url parameters", async () => {
        const testCode = "my_test_code"
        const testState = "my_test_state"
        mockQueryParamCodeAndState(testCode, testState)
        const accessToken = "my_access_token_1234"
        const tokenData = { access_token: accessToken }
        mockMultipleGets({
            routes: [
                {
                    route: "/auth/login/callback",
                    data: tokenData,
                },
                {
                    route: "/pool",
                    error: new AxiosError("no pool", "404"),
                },
            ],
            returnHeader: "my_access_token_1234",
        })

        testComponent(
            <TestQueryProvider>
                <Main />
            </TestQueryProvider>,
        )

        await act(async () => await new Promise((r: TimerHandler) => setTimeout(r)))
        expect(useTokenQuery().token).toEqual(accessToken)
    })

    describe("Pool deletion operations", () => {
        beforeEach(() => {
            useSearchStore.setState({ isOpened: false })
            mockLoginState()
            const mockedPool = mockedTrackPoolData()
            usePoolStore.setState({ pool: mockedPool, confirmingOverwrite: null, poolState: PoolState.Normal })
            mockMultipleGets({
                routes: [
                    {
                        route: "/me",
                        data: mockedPool.owner,
                    },
                    {
                        route: "/pool",
                        data: mockedPool,
                    },
                ],
                returnHeader: "my_access_token_1234",
            })
        })

        it("Should prompt whether user wants to delete the pool when clicking delete pool", async () => {
            const { user } = testComponent(
                <TestQueryProvider>
                    <Main />
                </TestQueryProvider>,
            )

            await user.click(await screen.findByRole("button", { name: "Delete pool" }))

            expect(screen.getByRole("heading", { name: "Warning!" })).toBeDefined()
            expect(
                screen.getByText(
                    "You are about to delete your current playback pool! This cannot be reversed. Do you wish to continue?",
                ),
            ).toBeDefined()
            expect(screen.getByRole("button", { name: "Cancel" })).toBeDefined()
            expect(screen.getByRole("button", { name: "Continue" })).toBeDefined()
        })

        it("Should not delete pool if cancelling on pool delete modal", async () => {
            const { user } = testComponent(
                <TestQueryProvider>
                    <Main />
                </TestQueryProvider>,
            )

            await user.click(await screen.findByRole("button", { name: "Delete pool" }))
            await user.click(screen.getByRole("button", { name: "Cancel" }))

            // We want to find both the pool member card and the playback status
            expect(screen.getAllByText(mockedTrackPoolData().users[0].tracks[0].name).length).toBe(2)
            expect(usePoolStore.getState().pool).toBeDefined()
        })

        it("Should delete pool if continuing on pool delete modal", async () => {
            mockAxiosDelete(null)
            mockMultipleGets({
                routes: [
                    {
                        route: "/me",
                        data: mockedTrackPoolData().owner,
                    },
                    {
                        route: "/pool",
                        data: null,
                    },
                ],
                returnHeader: "my_access_token_1234",
            })
            const { user } = testComponent(
                <TestQueryProvider>
                    <Main />
                </TestQueryProvider>,
            )

            await user.click(await screen.findByRole("button", { name: "Delete pool" }))
            await user.click(await screen.findByRole("button", { name: "Continue" }))

            await new Promise((r: TimerHandler) => setTimeout(r, 100))

            expect(screen.queryByText(mockedTrackPoolData().users[0].tracks[0].name)).toBeNull()
            expect(usePoolStore.getState().pool).toBeNull()
        })

        it("Should show alert after successfully deleting pool", async () => {
            mockAxiosDelete(null)
            const { user } = testComponent(
                <TestQueryProvider>
                    <Main />
                </TestQueryProvider>,
            )

            await user.click(await screen.findByRole("button", { name: "Delete pool" }))
            await user.click(screen.getByRole("button", { name: "Continue" }))

            await new Promise((r: TimerHandler) => setTimeout(r, 50))

            expect(useAlertStore.getState().alerts[0].message).toBe("Deleted your pool")
        })
    })

    describe("Pool leaving operations", () => {
        beforeEach(() => {
            useSearchStore.setState({ isOpened: false })
            mockLoginState()
            const mockedPool = mockedTrackPoolData()
            usePoolStore.setState({ pool: mockedPool, confirmingOverwrite: null, poolState: PoolState.Normal })
            mockMultipleGets({
                routes: [
                    {
                        route: "/me",
                        data: { display_name: "tester", icon_url: "test.icon", spotify_id: "tester" },
                    },
                    {
                        route: "/pool",
                        data: mockedPool,
                    },
                ],
                returnHeader: "my_access_token_1234",
            })
        })

        it("Should prompt whether user wants to leave the pool when clicking leave pool", async () => {
            const { user } = testComponent(
                <TestQueryProvider>
                    <Main />
                </TestQueryProvider>,
            )

            await user.click(await screen.findByRole("button", { name: "Leave pool" }))

            expect(screen.getByRole("heading", { name: "Warning!" })).toBeDefined()
            expect(
                screen.getByText("You are about to leave your current playback pool. Do you wish to continue?"),
            ).toBeDefined()
            expect(screen.getByRole("button", { name: "Cancel" })).toBeDefined()
            expect(screen.getByRole("button", { name: "Continue" })).toBeDefined()
        })

        it("Should not leave pool if cancelling on pool leave modal", async () => {
            const { user } = testComponent(
                <TestQueryProvider>
                    <Main />
                </TestQueryProvider>,
            )

            await user.click(await screen.findByRole("button", { name: "Leave pool" }))
            await user.click(screen.getByRole("button", { name: "Cancel" }))

            // We want to find both the pool member card and the playback status
            expect(screen.getAllByText(mockedTrackPoolData().users[0].tracks[0].name).length).toBe(2)
            expect(usePoolStore.getState().pool).toBeDefined()
        })

        it("Should leave pool if continuing on pool leave modal", async () => {
            mockAxiosPost(null)
            mockMultipleGets({
                routes: [
                    {
                        route: "/me",
                        data: { display_name: "tester", icon_url: "test.icon", spotify_id: "tester" },
                    },
                    {
                        route: "/pool",
                        data: null,
                    },
                ],
                returnHeader: "my_access_token_1234",
            })
            const { user } = testComponent(
                <TestQueryProvider>
                    <Main />
                </TestQueryProvider>,
            )

            await user.click(await screen.findByRole("button", { name: "Leave pool" }))
            await user.click(await screen.findByRole("button", { name: "Continue" }))

            await new Promise((r: TimerHandler) => setTimeout(r, 100))

            expect(screen.queryByText(mockedTrackPoolData().users[0].tracks[0].name)).toBeNull()
            expect(usePoolStore.getState().pool).toBeNull()
        })

        it("Should show alert after successfully leaving pool", async () => {
            mockAxiosPost(null)
            const expectedUserName = mockedTrackPoolData().owner.display_name
            const { user } = testComponent(
                <TestQueryProvider>
                    <Main />
                </TestQueryProvider>,
            )

            await user.click(await screen.findByRole("button", { name: "Leave pool" }))
            await user.click(screen.getByRole("button", { name: "Continue" }))

            await new Promise((r: TimerHandler) => setTimeout(r, 50))

            expect(useAlertStore.getState().alerts[0].message).toBe(`Left ${expectedUserName}'s pool`)
        })
    })
})
