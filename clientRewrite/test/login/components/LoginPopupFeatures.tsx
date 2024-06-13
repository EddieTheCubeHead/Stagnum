import { describe, expect, it } from "vitest"
import { render, screen } from "@testing-library/react"
import { LoginPopup } from "../../../src/login/components/LoginPopup"

describe("LoginPopup", () => {
    it("Should display stagnum logo", () => {
        render(<LoginPopup />)

        expect(screen.getByText("Stagnum")).toBeDefined()
    })

    it("Should prompt the user to use Spotify for logging in", () => {
        render(<LoginPopup />)

        expect(screen.getByText("Please log in with your Spotify account")).toBeDefined()
    })
})
