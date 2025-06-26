import { describe, it, expect } from "vitest"
import { screen } from "@testing-library/react"
import { Pool } from "../../../src/pool/views/Pool"
import { usePoolStore } from "../../../src/common/stores/poolStore"
import { mockedCollectionPoolData, mockedTrackPoolData } from "../../search/data/mockPoolData"
import { mockAxiosDelete, mockAxiosGet } from "../../utils/mockAxios"
import { TestQueryProvider } from "../../utils/TestQueryProvider"
import { useTokenStore } from "../../../src/common/stores/tokenStore"
import { useAlertStore } from "../../../src/alertSystem/alertStore"
import testComponent from "../../utils/testComponent.tsx"

describe("Pool", () => {
    it("Should render pool contents if present", () => {
        usePoolStore.setState({ pool: mockedTrackPoolData() })
        testComponent(
            <TestQueryProvider>
                <Pool />
            </TestQueryProvider>,
        )

        expect(screen.getByText(mockedTrackPoolData().users[0].tracks[0].name)).toBeDefined()
    })

    it("Should say 'Pool owner: You' if pool is owned by current user", async () => {
        const mockedPool = mockedCollectionPoolData()
        useTokenStore.setState({ token: "my_test_token_1234" })
        usePoolStore.setState({ pool: mockedPool })
        mockAxiosGet({ display_name: "heiasi", icon_url: "test.icon.png", spotify_id: "heiasi" })
        testComponent(
            <TestQueryProvider>
                <Pool />
            </TestQueryProvider>,
        )

        expect(await screen.findByText("Pool owner")).toBeDefined()
        expect(await screen.findByText("You")).toBeDefined()
    })

    it("Should tell pool owner if pool is not owned by current user", async () => {
        const mockedPool = mockedCollectionPoolData()
        useTokenStore.setState({ token: "my_test_token_1234" })
        usePoolStore.setState({ pool: mockedPool })
        mockAxiosGet({ display_name: "Test", icon_url: "test.icon.png", spotify_id: "Test" })
        testComponent(
            <TestQueryProvider>
                <Pool />
            </TestQueryProvider>,
        )

        expect(await screen.findByText("Pool owner")).toBeDefined()
        expect(await screen.findByText("heiasi")).toBeDefined()
    })

    it("Should allow opening pool member collections", async () => {
        usePoolStore.setState({ pool: mockedCollectionPoolData() })
        const { user } = testComponent(
            <TestQueryProvider>
                <Pool />
            </TestQueryProvider>,
        )

        expect(screen.getByText(mockedCollectionPoolData().users[0].collections[0].name)).toBeDefined()
        expect(screen.queryByText(mockedCollectionPoolData().users[0].collections[0].tracks[0].name)).toBeNull()

        await user.click(screen.getByRole("button", { name: "Open" }))

        expect(screen.getByText(mockedCollectionPoolData().users[0].collections[0].tracks[0].name)).toBeDefined()
    })

    it("Should delete resource from pool when pressing delete button", async () => {
        const mock_pool_data = mockedTrackPoolData()
        useTokenStore.setState({ token: "my_test_token_1234" })
        mockAxiosDelete(mock_pool_data)
        usePoolStore.setState({ pool: mockedCollectionPoolData() })
        const { user } = testComponent(
            <TestQueryProvider>
                <Pool />
            </TestQueryProvider>,
        )

        await user.click(screen.getAllByRole("button", { name: "Delete" })[0])

        expect(usePoolStore.getState().pool).toBe(mock_pool_data)
    })

    it("Should create alert when successfully deleting pool resource", async () => {
        mockAxiosGet(null)
        const mock_pool_data = mockedTrackPoolData()
        useTokenStore.setState({ token: "my_test_token_1234" })
        mockAxiosDelete(mock_pool_data)
        const expectedDeletedName = mockedCollectionPoolData().users[0].collections[0].name
        usePoolStore.setState({ pool: mockedCollectionPoolData() })
        const { user } = testComponent(
            <TestQueryProvider>
                <Pool />
            </TestQueryProvider>,
        )

        await user.click(screen.getAllByRole("button", { name: "Delete" })[0])

        await new Promise((resolve: TimerHandler) => setTimeout(resolve, 50))

        expect(useAlertStore.getState().alerts[0].message).toBe(`Deleted "${expectedDeletedName}" from pool`)
    })
})
