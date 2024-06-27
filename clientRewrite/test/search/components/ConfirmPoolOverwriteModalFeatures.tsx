import { describe, expect, it } from "vitest"
import { ConfirmPoolOverwriteModal } from "../../../src/pool/components/ConfirmPoolOverwriteModal"
import { act, render, screen } from "@testing-library/react"
import { usePoolStore } from "../../../src/common/stores/poolStore"
import { mockAxiosPost } from "../../utils/mockAxios"
import { mockedCollectionPoolData } from "../data/mockPoolData"
import { useTokenStore } from "../../../src/common/stores/tokenStore"

describe("ConfirmPoolOverwriteModal", () => {
    it("Should wipe confirming state on cancel button", () => {
        usePoolStore.setState({ confirmingOverwrite: "some string" })
        render(<ConfirmPoolOverwriteModal />)

        act(() => screen.getByRole("button", { name: "Cancel" }).click())

        expect(usePoolStore.getState().confirmingOverwrite).toBe("")
    })

    // @ts-expect-error
    it("Should call create pool on confirm button", async () => {
        const mockedPool = mockedCollectionPoolData()
        mockAxiosPost(mockedPool)
        useTokenStore.setState({ token: "any token" })
        usePoolStore.setState({ confirmingOverwrite: "some string" })
        render(<ConfirmPoolOverwriteModal />)

        act(() => screen.getByRole("button", { name: "Continue" }).click())

        // @ts-expect-error
        await new Promise((resolve: TimerHandler) => setTimeout(resolve, 50))

        expect(usePoolStore.getState().confirmingOverwrite).toBe("")
        expect(usePoolStore.getState().pool).toBe(mockedPool)
    })
})
