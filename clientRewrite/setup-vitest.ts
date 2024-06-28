import { beforeEach, afterEach, vi } from "vitest"
import { cleanup } from "@testing-library/react"
import { useTokenStore } from "./src/common/stores/tokenStore"
import { Theme, useThemeStore } from "./src/common/stores/themeStore"
import { useAlertStore } from "./src/alertSystem/alertStore"
import { usePoolStore } from "./src/common/stores/poolStore"

beforeEach(() => {
    vi.mock("./src/common/hooks/useStartWebSocket", () => {
        return {
            useStartWebSocket: () => {
                return () => {}
            },
        }
    })
})

afterEach(() => {
    cleanup()
    useTokenStore.setState({ token: null })
    useThemeStore.setState({ theme: Theme.Dark })
    useAlertStore.setState({ alerts: [] })
    usePoolStore.setState({ pool: null })
})
