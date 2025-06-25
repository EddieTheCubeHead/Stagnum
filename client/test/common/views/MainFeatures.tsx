import { expect, it, describe, vi, beforeEach } from "vitest"
import { act, render, screen } from "@testing-library/react"
import { TestQueryProvider } from "../../utils/TestQueryProvider"
import { useTokenStore } from "../../../src/common/stores/tokenStore"
import { Main } from "../../../src/common/views/Main"
import { mockAxiosDelete, mockAxiosGet, mockAxiosPost, mockMultipleGets } from "../../utils/mockAxios"
import { useSearchStore } from "../../../src/common/stores/searchStore"
import { PoolState, usePoolStore } from "../../../src/common/stores/poolStore"
import { mockedCollectionPoolData, mockedTrackPoolData } from "../../search/data/mockPoolData"
import { userEvent } from "@testing-library/user-event"
import { useAlertStore } from "../../../src/alertSystem/alertStore"

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
        mockMultipleGets({
            routes: [
                {
                    route: "/auth/login/callback",
                    data: tokenData,
                },
                {
                    route: "/pool",
                    data: null,
                },
            ],
            returnHeader: "my_access_token_1234",
        })

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

        // @ts-ignore
        it("Should prompt whether user wants to delete the pool when clicking delete pool", async () => {
            render(
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

        // @ts-expect-error
        it("Should not delete pool if cancelling on pool delete modal", async () => {
            render(
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

        // @ts-expect-error
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
            render(
                <TestQueryProvider>
                    <Main />
                </TestQueryProvider>,
            )

            await user.click(await screen.findByRole("button", { name: "Delete pool" }))
            await user.click(await screen.findByRole("button", { name: "Continue" }))

            // @ts-expect-error
            await new Promise((r: TimerHandler) => setTimeout(r, 100))

            expect(screen.queryByText(mockedTrackPoolData().users[0].tracks[0].name)).toBeNull()
            expect(usePoolStore.getState().pool).toBeNull()
        })

        // @ts-expect-error
        it("Should show alert after successfully deleting pool", async () => {
            mockAxiosDelete(null)
            render(
                <TestQueryProvider>
                    <Main />
                </TestQueryProvider>,
            )

            await user.click(await screen.findByRole("button", { name: "Delete pool" }))
            await user.click(screen.getByRole("button", { name: "Continue" }))

            // @ts-expect-error
            await new Promise((r: TimerHandler) => setTimeout(r, 50))

            expect(useAlertStore.getState().alerts[0].message).toBe("Deleted your pool")
        })
    })

    describe("Pool leaving operations", () => {
        const user = userEvent.setup()

        beforeEach(() => {
            useSearchStore.setState({ isOpened: false })
            useTokenStore.setState({ token: "my_test_token_1234" })
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

        // @ts-ignore
        it("Should prompt whether user wants to leave the pool when clicking leave pool", async () => {
            render(
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

        // @ts-expect-error
        it("Should not leave pool if cancelling on pool leave modal", async () => {
            render(
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

        // @ts-expect-error
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
            render(
                <TestQueryProvider>
                    <Main />
                </TestQueryProvider>,
            )

            await user.click(await screen.findByRole("button", { name: "Leave pool" }))
            await user.click(await screen.findByRole("button", { name: "Continue" }))

            // @ts-expect-error
            await new Promise((r: TimerHandler) => setTimeout(r, 100))

            expect(screen.queryByText(mockedTrackPoolData().users[0].tracks[0].name)).toBeNull()
            expect(usePoolStore.getState().pool).toBeNull()
        })

        // @ts-expect-error
        it("Should show alert after successfully leaving pool", async () => {
            mockAxiosPost(null)
            const expectedUserName = mockedTrackPoolData().owner.display_name
            render(
                <TestQueryProvider>
                    <Main />
                </TestQueryProvider>,
            )

            await user.click(await screen.findByRole("button", { name: "Leave pool" }))
            await user.click(screen.getByRole("button", { name: "Continue" }))

            // @ts-expect-error
            await new Promise((r: TimerHandler) => setTimeout(r, 50))

            expect(useAlertStore.getState().alerts[0].message).toBe(`Left ${expectedUserName}'s pool`)
        })
    })
})
