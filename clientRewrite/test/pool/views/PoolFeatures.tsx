import { describe, it, expect } from "vitest"
import { render, screen } from "@testing-library/react"
import { Pool } from "../../../src/pool/views/Pool"
import { usePoolStore } from "../../../src/common/stores/poolStore"
import { mockedCollectionPoolData, mockedTrackPoolData } from "../../search/data/mockPoolData"
import { mockAxiosGet } from "../../utils/mockAxios"
import { TestQueryProvider } from "../../utils/TestQueryProvider"
import { useTokenStore } from "../../../src/common/stores/tokenStore"

describe("Pool", () => {
    it("Should render pool contents if present", () => {
        usePoolStore.setState({ pool: mockedTrackPoolData() })
        render(
            <TestQueryProvider>
                <Pool />
            </TestQueryProvider>,
        )

        expect(screen.getByText(mockedTrackPoolData().users[0].tracks[0].name)).toBeDefined()
    })

    // @ts-expect-error
    it("Should say 'your pool' if pool is owned by current user", async () => {
        const mockedPool = mockedCollectionPoolData()
        useTokenStore.setState({ token: "my_test_token_1234" })
        usePoolStore.setState({ pool: mockedPool })
        mockAxiosGet({ display_name: "heiasi", icon_url: "test.icon.png", spotify_id: "heiasi" })
        render(
            <TestQueryProvider>
                <Pool />
            </TestQueryProvider>,
        )

        // @ts-expect-error
        await new Promise((resolve: TimerHandler) => setTimeout(resolve, 50))

        expect(screen.getByText("Pool owner")).toBeDefined()
        expect(screen.getByText("You")).toBeDefined()
    })
})
