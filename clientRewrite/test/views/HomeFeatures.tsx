import { describe, it, expect, vi } from "vitest"
import { Home } from "../../src/views/Home"
import { render, screen } from "@testing-library/react"
import { TestQueryProvider } from "../utils/TestQueryProvider"

describe("Home", () => {
    it("Should render placeholder", () => {
        render(
            <TestQueryProvider>
                <Home />
            </TestQueryProvider>,
        )

        expect(screen.getByText("Home")).toBeDefined()
    })
})
