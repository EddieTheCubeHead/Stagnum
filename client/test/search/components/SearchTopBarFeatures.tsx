import { describe, it, expect } from "vitest"
import { screen } from "@testing-library/react"
import { SearchTopBar } from "../../../src/search/components/searchTopBar/SearchTopBar"
import testComponent from "../../utils/testComponent.tsx"

// TODO move to search features in acceptance tests
describe.skip("SearchTopBar", () => {
    describe.each(["Track", "Album", "Artist", "Playlist"])("%s", (resourceType) => {
        it(`Should set ${resourceType.toLowerCase()}s as the only open category on click ${resourceType.toLowerCase()}s button`, async () => {
            const { user } = testComponent(<SearchTopBar />)

            await user.click(screen.getByRole("button", { name: `${resourceType} ${resourceType}s` }))

            const { isTracksOpened, isAlbumsOpened, isPlaylistsOpened, isArtistsOpened } = useSearchStore.getState()
            const searchState = { isTracksOpened, isAlbumsOpened, isPlaylistsOpened, isArtistsOpened }

            for (const field in searchState) {
                expect(searchState[field as keyof typeof searchState]).toBe(field === `is${resourceType}sOpened`)
            }
        })

        it(`Should set all categories as open on second click on ${resourceType.toLowerCase()}s button`, async () => {
            const { user } = testComponent(<SearchTopBar />)

            await user.click(screen.getByRole("button", { name: `${resourceType} ${resourceType}s` }))
            await user.click(screen.getByRole("button", { name: `${resourceType} ${resourceType}s` }))

            expect(useSearchStore.getState().isTracksOpened).toBe(true)
            expect(useSearchStore.getState().isAlbumsOpened).toBe(true)
            expect(useSearchStore.getState().isArtistsOpened).toBe(true)
            expect(useSearchStore.getState().isPlaylistsOpened).toBe(true)
        })
    })
})
