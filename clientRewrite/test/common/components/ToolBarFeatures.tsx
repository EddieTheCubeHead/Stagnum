import { describe, it, expect, beforeEach, vi, afterEach } from "vitest"
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

    describe("Debounce", () => {
        const debounceDelay = 511

        beforeEach(() => {
            vi.useFakeTimers()
        })

        afterEach(() => {
            vi.restoreAllMocks()
        })

        it("Should set search query with debounce delay after typing", () => {
            render(<ToolBar />)

            act(() => {
                screen.getByRole("button", { name: "Search" }).click()
            })
            fireEvent.change(screen.getByRole("textbox"), { target: { value: "test" } })
            fireEvent.change(screen.getByRole("textbox"), { target: { value: "test query" } })

            expect(useSearchStore.getState().query).toBe("")

            vi.advanceTimersByTime(debounceDelay + 1)

            expect(useSearchStore.getState().query).toBe("test query")
        })

        it("Should not change search query if search input changes to empty string", () => {
            useSearchStore.setState({ query: "test" })
            render(<ToolBar />)

            act(() => {
                screen.getByRole("button", { name: "Search" }).click()
            })
            fireEvent.change(screen.getByRole("textbox"), { target: { value: "test" } })
            fireEvent.change(screen.getByRole("textbox"), { target: { value: "" } })

            vi.advanceTimersByTime(debounceDelay + 1)

            expect(useSearchStore.getState().query).toBe("test")
        })
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
