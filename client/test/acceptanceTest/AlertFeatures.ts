import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from "vitest"
import { server } from "./server.ts"
import { PoolState, usePoolStore } from "../../src/common/stores/poolStore.ts"
import { mockLoginState } from "../utils/mockLoginState.ts"
import { testApp } from "../utils/testComponent.tsx"
import { act, screen } from "@testing-library/react"
import { mockedCollectionPoolData } from "./data/pool.ts"
import { delError } from "./handlers.ts"

describe("Alerts features", () => {
    const alert_despawn_time = 7001

    // Workaround for bug in @testing-library/react when using user-event with `vi.useFakeTimers()`
    // gotten from https://github.com/testing-library/user-event/issues/1115#issuecomment-1506220345
    beforeAll(() => {
        server.listen()

        // @ts-expect-error - global fuckery
        const _jest = globalThis.jest

        // @ts-expect-error - global fuckery
        globalThis.jest = {
            // @ts-expect-error - global fuckery
            ...globalThis.jest,
            advanceTimersByTime: vi.advanceTimersByTime.bind(vi),
        }

        // @ts-expect-error - global fuckery
        return () => void (globalThis.jest = _jest)
    })

    afterEach(() => {
        server.resetHandlers()
        vi.useRealTimers()
    })

    afterAll(() => server.close())

    beforeEach(() => {
        vi.resetAllMocks()
        usePoolStore.setState({ poolState: PoolState.Normal })
        mockLoginState()
        vi.useFakeTimers()
    })

    it("Should despawn success alert after seven seconds", async () => {
        const { user } = await testApp({ userEventOptions: { advanceTimers: vi.advanceTimersByTime } })
        await user.click(
            screen.getByRole("button", { name: `Open ${mockedCollectionPoolData.users[0].collections[0].name}` }),
        )
        await user.click(
            screen.getByRole("button", {
                name: `Delete ${mockedCollectionPoolData.users[0].collections[0].tracks[0].name}`,
            }),
        )

        expect(
            await screen.findByText(
                `Deleted "${mockedCollectionPoolData.users[0].collections[0].tracks[0].name}" from pool`,
            ),
        ).toBeVisible()
        await act(async () => await vi.advanceTimersByTimeAsync(alert_despawn_time - 100))
        expect(
            await screen.findByText(
                `Deleted "${mockedCollectionPoolData.users[0].collections[0].tracks[0].name}" from pool`,
            ),
        ).toBeVisible()
        await act(async () => await vi.advanceTimersByTimeAsync(100))
        expect(
            screen.queryByText(
                `Deleted "${mockedCollectionPoolData.users[0].collections[0].tracks[0].name}" from pool`,
            ),
        ).not.toBeInTheDocument()
    })

    // Regression test for #439
    it("Should count down timers from multiple alerts simultaneously", async () => {
        const { user } = await testApp({ userEventOptions: { advanceTimers: vi.advanceTimersByTime } })
        await user.click(
            screen.getByRole("button", { name: `Open ${mockedCollectionPoolData.users[0].collections[0].name}` }),
        )
        for (const track of mockedCollectionPoolData.users[0].collections[0].tracks) {
            await user.click(screen.getByRole("button", { name: `Delete ${track.name}` }))
        }
        await act(async () => await vi.advanceTimersByTimeAsync(alert_despawn_time))
        for (const track of mockedCollectionPoolData.users[0].collections[0].tracks) {
            expect(screen.queryByText(`Deleted "${track.name}" from pool`)).not.toBeInTheDocument()
        }
    })

    it("Should not dismiss error alerts automatically", async () => {
        const errorText = "Test error"
        server.use(delError("pool/content/*", 402, errorText))
        const { user } = await testApp({ userEventOptions: { advanceTimers: vi.advanceTimersByTime } })

        await user.click(
            screen.getByRole("button", { name: `Open ${mockedCollectionPoolData.users[0].collections[0].name}` }),
        )
        await user.click(
            screen.getByRole("button", {
                name: `Delete ${mockedCollectionPoolData.users[0].collections[0].tracks[0].name}`,
            }),
        )

        expect(await screen.findByText(errorText)).toBeVisible()
        await act(async () => await vi.advanceTimersByTimeAsync(alert_despawn_time * 2))
        expect(await screen.findByText(errorText)).toBeVisible()
    })
})
