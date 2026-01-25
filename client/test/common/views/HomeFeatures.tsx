import { describe, it, expect } from "vitest"
import { Home } from "../../../src/common/views/Home"
import { screen } from "@testing-library/react"
import { mockMultipleGets } from "../../utils/mockAxios"
import { usePoolStore } from "../../../src/common/stores/poolStore"
import { mockedCollectionPoolData } from "../../search/data/mockPoolData"
import { testComponentWithRouter } from "../../utils/testComponent.tsx"

// TODO convert to acceptance tests
describe.skip("Home", () => {
    it("Should render confirm pool overwrite modal if overwrite attempted", async () => {
        usePoolStore.setState({ confirmingOverwrite: { name: "name", uri: "uri", link: "link" } })
        await testComponentWithRouter(<Home />)

        expect(screen.getByRole("heading", { name: "Warning!" })).toBeVisible()
        expect(
            screen.getByText(
                "Creating a new playback pool will overwrite your current one! Are you sure you want to continue?",
            ),
        ).toBeVisible()
        expect(screen.getByRole("button", { name: "Cancel" })).toBeVisible()
        expect(screen.getByRole("button", { name: "Continue" })).toBeVisible()
    })

    it("Should fetch existing pool from server on Home view render", async () => {
        const mockPool = mockedCollectionPoolData()
        mockMultipleGets({
            routes: [
                {
                    route: "/pool",
                    data: mockPool,
                },
            ],
        })
        await testComponentWithRouter(<Home />)

        expect(await screen.findByText(mockedCollectionPoolData().users[0].collections[0].name)).toBeVisible()
    })
})
