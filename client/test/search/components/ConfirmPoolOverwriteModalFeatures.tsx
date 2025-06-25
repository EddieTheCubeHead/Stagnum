import { beforeEach, describe, expect, it } from "vitest"
import { ConfirmPoolOverwriteModal } from "../../../src/pool/components/ConfirmPoolOverwriteModal"
import { act, render, screen } from "@testing-library/react"
import { usePoolStore } from "../../../src/common/stores/poolStore"
import { mockAxiosPost } from "../../utils/mockAxios"
import { mockedCollectionPoolData, mockedTrackPoolData } from "../data/mockPoolData"
import { useTokenStore } from "../../../src/common/stores/tokenStore"

describe("ConfirmPoolOverwriteModal", () => {
    beforeEach(() => {
        usePoolStore.setState({ pool: mockedTrackPoolData() })
    })

    it("Should wipe confirming state on cancel button", () => {
        usePoolStore.setState({ confirmingOverwrite: { name: "some name", uri: "some uri", link: "some link" } })
        render(<ConfirmPoolOverwriteModal />)

        act(() => screen.getByRole("button", { name: "Cancel" }).click())

        expect(usePoolStore.getState().confirmingOverwrite).toBeNull()
    })

    // @ts-expect-error
    it("Should call create pool on confirm button", async () => {
        const mockedPool = mockedCollectionPoolData()
        mockAxiosPost(mockedPool)
        useTokenStore.setState({ token: "any token" })
        usePoolStore.setState({ confirmingOverwrite: { name: "some name", uri: "some uri", link: "some link" } })
        render(<ConfirmPoolOverwriteModal />)

        act(() => screen.getByRole("button", { name: "Continue" }).click())

        // @ts-expect-error
        await new Promise((resolve: TimerHandler) => setTimeout(resolve, 50))

        expect(usePoolStore.getState().confirmingOverwrite).toBeNull()
        expect(usePoolStore.getState().pool).toBe(mockedPool)
    })
})
