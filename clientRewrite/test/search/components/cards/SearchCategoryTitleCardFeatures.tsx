import { describe, it, expect } from "vitest"
import { SearchCategoryTitleCard } from "../../../../src/search/components/cards/SearchCategoryTitleCard"
import { useState } from "react"
import { TrackIconSvg } from "../../../../src/common/icons/svgs/TrackIconSvg"
import { act, render, screen } from "@testing-library/react"

const TestTitleCard = () => {
    const [isOpen, setIsOpen] = useState<boolean>(true)
    return <SearchCategoryTitleCard isOpen={isOpen} setIsOpen={setIsOpen} iconSvg={<TrackIconSvg />} title="Test" />
}

describe("SearchCategoryTitleCardFeatures", () => {
    it("Should render header from given title", () => {
        render(<TestTitleCard />)

        expect(screen.getByRole("heading", { name: "Test" })).toBeDefined()
    })

    it("Should render collapse icon initially", () => {
        render(<TestTitleCard />)

        expect(screen.getByTitle("Collapse")).toBeDefined()
    })

    it("Should render open icon after collapsing state", () => {
        render(<TestTitleCard />)

        act(() => screen.getByRole("button", { name: "Collapse" }).click())

        expect(screen.getByTitle("Open")).toBeDefined()
    })
})
