import { describe, expect, it, vi } from "vitest"
import { TopBar } from "../src/common/components/topBar/TopBar"
import { render, screen } from "@testing-library/react"

describe("Top bar", () => {
    it("Should render app name", () => {
        render(<TopBar userName="Test" />)

        expect(screen.getByText("Stagnum")).toBeDefined()
    })

    it("Should render username first letter if image missing", () => {
        render(<TopBar userName="Test" />)

        expect(screen.getByText("T")).toBeDefined()
    })
})
