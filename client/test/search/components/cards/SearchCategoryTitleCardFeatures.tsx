import { describe, it, expect } from "vitest"
import { SearchCategoryTitleCard } from "../../../../src/search/components/cards/SearchCategoryTitleCard"
import { useState } from "react"
import { TrackIconSvg } from "../../../../src/common/icons/svgs/TrackIconSvg"
import { screen } from "@testing-library/react"
import { testComponent } from "../../../utils/testComponent.tsx"

const TestTitleCard = () => {
    const [isOpen, setIsOpen] = useState<boolean>(true)
    return <SearchCategoryTitleCard isOpen={isOpen} setIsOpen={setIsOpen} iconSvg={<TrackIconSvg />} title="Test" />
}

describe.skip("SearchCategoryTitleCardFeatures", () => {
    it("Should render header from given title", () => {
        testComponent(<TestTitleCard />)

        expect(screen.getByRole("heading", { name: "Test" })).toBeVisible()
    })

    it("Should render collapse icon initially", () => {
        testComponent(<TestTitleCard />)

        expect(screen.getByTitle("Collapse")).toBeVisible()
    })

    it("Should render open icon after collapsing state", async () => {
        const { user } = testComponent(<TestTitleCard />)

        await user.click(screen.getByRole("button", { name: "Collapse" }))

        expect(screen.getByTitle("Open")).toBeVisible()
    })
})
