import { describe, expect, it, vi } from "vitest"
import { TopBar } from "../../../src/common/components/TopBar"
import { render, screen } from "@testing-library/react"
import { useUserStore } from "../../../src/common/stores/userStore"

describe("Top bar", () => {
    it("Should render app name", () => {
        render(<TopBar />)

        expect(screen.getByText("Stagnum")).toBeDefined()
    })

    it("Should render question in place of username initial placeholder if no user data", () => {
        render(<TopBar />)

        expect(screen.getByText("?")).toBeDefined()
    })

    it("Should render username first letter if image missing", () => {
        useUserStore.setState({ user: { display_name: "Test", icon_url: null, spotify_id: "1234" } })
        render(<TopBar />)

        expect(screen.getByText("T")).toBeDefined()
    })
})
