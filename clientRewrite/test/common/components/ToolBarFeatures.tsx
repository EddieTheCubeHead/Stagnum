import { describe, it, expect } from "vitest"
import { act, fireEvent, render, screen } from "@testing-library/react"
import { ToolBar } from "../../../src/common/components/toolbar/ToolBar"
import { useSearchStore } from "../../../src/common/stores/searchStore"

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

        act(() => screen.getByRole("button", { name: "Search" }).click())

        expect(screen.getByRole("button", { name: "Close search" })).toBeDefined()
        expect(screen.getByPlaceholderText("Search...")).toBeDefined()
    })

    it("Should not set search query immediately after typing", () => {
        render(<ToolBar />)

        act(() => {
            screen.getByRole("button", { name: "Search" }).click()
        })
        fireEvent.change(screen.getByRole("textbox"), { target: { value: "test query" } })

        expect(useSearchStore.getState().query).toBe("")
    })

    // @ts-expect-error
    it("Should set search query with debounce delay after typing", async () => {
        render(<ToolBar />)

        act(() => {
            screen.getByRole("button", { name: "Search" }).click()
        })
        fireEvent.change(screen.getByRole("textbox"), { target: { value: "test" } })
        fireEvent.change(screen.getByRole("textbox"), { target: { value: "test query" } })

        expect(useSearchStore.getState().query).toBe("")

        // @ts-expect-error
        await new Promise((resolve: TimerHandler) => setTimeout(resolve, 512))

        expect(useSearchStore.getState().query).toBe("test query")
    })

    // @ts-expect-error
    it("Should not change search query if search input changes to empty string", async () => {
        useSearchStore.setState({ query: "test" })
        render(<ToolBar />)

        act(() => {
            screen.getByRole("button", { name: "Search" }).click()
        })
        fireEvent.change(screen.getByRole("textbox"), { target: { value: "test" } })
        fireEvent.change(screen.getByRole("textbox"), { target: { value: "" } })
        // @ts-expect-error
        await new Promise((resolve: TimerHandler) => setTimeout(resolve, 512))

        expect(useSearchStore.getState().query).toBe("test")
    })

    it("Should set search query to be empty string when pressing close", () => {
        useSearchStore.setState({ query: "test" })
        render(<ToolBar />)

        act(() => {
            screen.getByRole("button", { name: "Search" }).click()
            screen.getByRole("button", { name: "Close search" }).click()
        })

        expect(useSearchStore.getState().query).toBe("")
    })
})
