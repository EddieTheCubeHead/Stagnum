import { beforeEach, describe, expect, it, vi } from "vitest"
import { useAlertStore } from "../../src/alertSystem/alertStore"
import { AlertType } from "../../src/alertSystem/Alert"
import { act, render, screen } from "@testing-library/react"
import { AlertHandler } from "../../src/alertSystem/AlertHandler"

describe("Alert system", () => {
    beforeEach(() => {
        useAlertStore.setState({ alerts: [] })
    })

    it("Should display alerts from alert queue", () => {
        useAlertStore.setState({ alerts: [{ type: AlertType.Error, message: "Test alert" }] })

        render(<AlertHandler />)

        expect(screen.getByText("Test alert")).toBeDefined()
    })

    it("Should allow dismissing errors with close button", () => {
        useAlertStore.setState({ alerts: [{ type: AlertType.Error, message: "Test alert" }] })

        render(<AlertHandler />)

        act(() => screen.getByRole("button", { name: "Close" }).click())

        expect(screen.queryByText("Test alert")).toBeNull()
    })

    it("Should allow dismissing success alerts with close button", () => {
        useAlertStore.setState({ alerts: [{ type: AlertType.Success, message: "Test alert" }] })

        render(<AlertHandler />)

        act(() => screen.getByRole("button", { name: "Close" }).click())

        expect(screen.queryByText("Test alert")).toBeNull()
    })

    it("Should dismiss success alerts after seven seconds", () => {
        vi.useFakeTimers()
        useAlertStore.setState({ alerts: [{ type: AlertType.Success, message: "Test alert" }] })

        render(<AlertHandler />)

        act(() => vi.advanceTimersByTime(7001))

        expect(screen.queryByText("Test alert")).toBeNull()
    })

    it("Should not dismiss error alerts automatically", () => {
        vi.useFakeTimers()
        useAlertStore.setState({ alerts: [{ type: AlertType.Error, message: "Test alert" }] })

        render(<AlertHandler />)

        act(() => vi.advanceTimersByTime(9999999))

        expect(screen.getByText("Test alert")).toBeDefined()
    })
})
