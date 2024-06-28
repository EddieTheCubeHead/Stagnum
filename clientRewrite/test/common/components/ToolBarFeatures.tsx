import { describe, it, expect, beforeEach, vi, afterEach } from "vitest"
import { act, fireEvent, render, screen } from "@testing-library/react"
import { ToolBar } from "../../../src/common/components/toolbar/ToolBar"
import { useSearchStore } from "../../../src/common/stores/searchStore"
import { usePoolStore } from "../../../src/common/stores/poolStore"
import { mockedTrackPoolData } from "../../search/data/mockPoolData"
import { ToolBarState, useToolBarStore } from "../../../src/common/stores/toolBarStore"
import { mockAxiosPost } from "../../utils/mockAxios"
import { SharePool } from "../../../src/pool/components/SharePool"
import axios from "axios"
import { mockedSearchData } from "../../search/data/mockedSearchData"

describe("Tool bar", () => {
    beforeEach(() => {
        useToolBarStore.setState({ state: ToolBarState.Normal })
    })

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

        expect(screen.getByRole("button", { name: "Close" })).toBeDefined()
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

    it("Should close search field when pressing close", () => {
        useSearchStore.setState({ query: "test" })
        render(<ToolBar />)

        fireEvent.click(screen.getByRole("button", { name: "Search" }))
        fireEvent.click(screen.getByRole("button", { name: "Close" }))

        expect(useSearchStore.getState().isOpened).toBe(false)
    })

    it("Should clear search query when pressing home", () => {
        useSearchStore.setState({ query: "test" })
        render(<ToolBar />)

        act(() => {
            screen.getByRole("button", { name: "Home" }).click()
        })

        expect(useSearchStore.getState().query).toBe("")
    })

    it("Should render delete pool as disabled if user has no pool", () => {
        render(<ToolBar />)

        expect(screen.queryByRole("button", { name: "Delete pool" })).toBeNull()
        expect(screen.getByTitle("Delete pool")).toBeDefined()
    })

    it("Should not render delete pool at all if search field is opened", () => {
        useToolBarStore.setState({ state: ToolBarState.Search })
        render(<ToolBar />)

        expect(screen.queryByTitle("Delete pool")).toBeNull()
    })

    it("Should render delete pool as button if user has a pool", () => {
        usePoolStore.setState({ pool: mockedTrackPoolData() })
        render(<ToolBar />)

        expect(screen.getByRole("button", { name: "Delete pool" })).toBeDefined()
    })

    it("Should render share pool share field after clicking on share pool", () => {
        const mockPool = mockedTrackPoolData()
        usePoolStore.setState({ pool: mockPool })
        mockPool.share_code = "123456"
        mockAxiosPost(mockPool)
        render(<ToolBar />)

        act(() => {
            screen.getByRole("button", { name: "Share pool" }).click()
        })

        expect(screen.getByText("123456")).toBeDefined()
    })

    it("Should render share pool skeleton after clicking on share pool if pool is loading", () => {
        const mockPool = mockedTrackPoolData()
        usePoolStore.setState({ pool: mockPool })
        mockPool.share_code = "123456"

        vi.spyOn(axios, "get").mockImplementation(async (url, config) => {
            // @ts-expect-error
            await new Promise((resolve: TimerHandler) => setTimeout(resolve, 500))
            return mockedSearchData()
        })

        render(<ToolBar />)

        screen.getByRole("button", { name: "Share pool" }).click()

        expect(screen.queryByText("123456")).toBeNull()
    })

    it("Should render code input after clicking join pool", () => {
        const mockPool = mockedTrackPoolData()
        usePoolStore.setState({ pool: mockPool })
        mockPool.share_code = "123456"
        mockAxiosPost(mockPool)
    })
})
