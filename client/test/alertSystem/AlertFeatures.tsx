import { beforeEach, describe, expect, it, vi } from "vitest"
import { useAlertStore } from "../../src/alertSystem/alertStore"
import { AlertType } from "../../src/alertSystem/Alert"
import { act, screen } from "@testing-library/react"
import { AlertHandler } from "../../src/alertSystem/AlertHandler"
import { testComponent } from "../utils/testComponent.tsx"

describe("Alert system", () => {
    beforeEach(() => {
        useAlertStore.setState({ alerts: [] })
    })

    it("Should display alerts from alert queue", () => {
        useAlertStore.setState({ alerts: [{ type: AlertType.Error, message: "Test alert" }] })

        testComponent(<AlertHandler />)

        expect(screen.getByText("Test alert")).toBeVisible()
    })

    it("Should allow dismissing errors with close button", async () => {
        useAlertStore.setState({ alerts: [{ type: AlertType.Error, message: "Test alert" }] })

        const { user } = testComponent(<AlertHandler />)

        await user.click(screen.getByRole("button", { name: "Close" }))

        expect(screen.queryByText("Test alert")).not.toBeInTheDocument()
    })

    it("Should allow dismissing success alerts with close button", async () => {
        useAlertStore.setState({ alerts: [{ type: AlertType.Success, message: "Test alert" }] })

        const { user } = testComponent(<AlertHandler />)

        await user.click(screen.getByRole("button", { name: "Close" }))

        expect(screen.queryByText("Test alert")).not.toBeInTheDocument()
    })

    it("Should dismiss success alerts after seven seconds", async () => {
        vi.useFakeTimers()
        useAlertStore.setState({ alerts: [{ type: AlertType.Success, message: "Test alert" }] })

        testComponent(<AlertHandler />)

        await act(() => vi.advanceTimersByTime(7001))

        expect(screen.queryByText("Test alert")).not.toBeInTheDocument()
        vi.useRealTimers()
    })

    it("Should not dismiss error alerts automatically", async () => {
        vi.useFakeTimers()
        useAlertStore.setState({ alerts: [{ type: AlertType.Error, message: "Test alert" }] })

        testComponent(<AlertHandler />)

        await act(() => vi.advanceTimersByTime(9999999))

        expect(screen.getByText("Test alert")).toBeVisible()
        vi.useRealTimers()
    })
})
