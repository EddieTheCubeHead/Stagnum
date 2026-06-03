import { beforeEach, afterEach, vi } from "vitest"
import { cleanup } from "@testing-library/react"
import { Theme, useThemeStore } from "./src/common/stores/themeStore"
import { useAlertStore } from "./src/alertSystem/alertStore"
import { usePoolStore } from "./src/common/stores/poolStore"
import "@testing-library/jest-dom"

export const TEST_BACKEND_URL = "test.server"

beforeEach(() => {
    vi.stubEnv("VITE_BACKEND_URL", TEST_BACKEND_URL)
})

afterEach(() => {
    cleanup()
    useThemeStore.setState({ theme: Theme.Dark })
    useAlertStore.setState({ alerts: [] })
    usePoolStore.setState({ pool: null })
})
