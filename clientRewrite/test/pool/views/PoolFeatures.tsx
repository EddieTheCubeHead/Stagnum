import { describe, it, expect } from "vitest"
import { render, screen } from "@testing-library/react"
import { Pool } from "../../../src/pool/views/Pool"
import { usePoolStore } from "../../../src/common/stores/poolStore"
import { mockedTrackPoolData } from "../../search/data/mockPoolData"

describe("Pool", () => {
    it("Should render pool contents if present", () => {
        usePoolStore.setState({ pool: mockedTrackPoolData() })
        render(<Pool />)

        expect(screen.getByText(mockedTrackPoolData().users[0].tracks[0].name)).toBeDefined()
    })
})
