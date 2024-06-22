import { describe, it, expect } from "vitest"
import { act, fireEvent, render, screen } from "@testing-library/react"
import { ToolBar } from "../../../src/common/components/toolbar/ToolBar"

describe("Tool bar", () => {
    it("Should render toolbarSearch button initially", () => {
        render(<ToolBar />)

        expect(screen.getByRole("button", { name: "Search" })).toBeDefined()
    })

    it("Should not initially render toolbarSearch field and close toolbarSearch buttons", () => {
        render(<ToolBar />)

        expect(screen.queryByRole("button", { name: "Close search" })).toBeNull()
        expect(screen.queryByPlaceholderText("Search...")).toBeNull()
    })

    it("Should render toolbarSearch field and close toolbarSearch buttons after click on open toolbarSearch button", () => {
        render(<ToolBar />)

        fireEvent.click(screen.getByRole("button", { name: "Search" }))

        expect(screen.getByRole("button", { name: "Close search" })).toBeDefined()
        expect(screen.getByPlaceholderText("Search...")).toBeDefined()
    })
})
