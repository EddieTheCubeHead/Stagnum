import { describe, it, expect } from "vitest"
import { Home } from "../../src/views/Home"
import { render, screen } from "@testing-library/react"

describe("Home", () => {
    it("Should render placeholder", () => {
        render(<Home />)

        expect(screen.getByText("Home")).toBeDefined()
    })
})
