import { beforeEach, describe, expect, it } from "vitest"
import { ConfirmPoolOverwriteModal } from "../../../src/pool/components/ConfirmPoolOverwriteModal"
import { screen } from "@testing-library/react"
import { usePoolStore } from "../../../src/common/stores/poolStore"
import { mockAxiosPost } from "../../utils/mockAxios"
import { mockedCollectionPoolData, mockedTrackPoolData } from "../data/mockPoolData"
import { useTokenStore } from "../../../src/common/stores/tokenStore"
import testComponent from "../../utils/testComponent.tsx"

describe("ConfirmPoolOverwriteModal", () => {
    beforeEach(() => {
        usePoolStore.setState({ pool: mockedTrackPoolData() })
    })

    it("Should wipe confirming state on cancel button", async () => {
        usePoolStore.setState({ confirmingOverwrite: { name: "some name", uri: "some uri", link: "some link" } })
        const { user } = testComponent(<ConfirmPoolOverwriteModal />)

        await user.click(screen.getByRole("button", { name: "Cancel" }))

        expect(usePoolStore.getState().confirmingOverwrite).toBeNull()
    })

    it("Should call create pool on confirm button", async () => {
        const mockedPool = mockedCollectionPoolData()
        mockAxiosPost(mockedPool)
        useTokenStore.setState({ token: "any token" })
        usePoolStore.setState({ confirmingOverwrite: { name: "some name", uri: "some uri", link: "some link" } })
        const { user } = testComponent(<ConfirmPoolOverwriteModal />)

        await user.click(screen.getByRole("button", { name: "Continue" }))

        expect(usePoolStore.getState().confirmingOverwrite).toBeNull()
        expect(usePoolStore.getState().pool).toBe(mockedPool)
    })
})
