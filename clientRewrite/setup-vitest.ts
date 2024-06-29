import { beforeEach, afterEach, vi } from "vitest"
import { cleanup } from "@testing-library/react"
import { useTokenStore } from "./src/common/stores/tokenStore"
import { Theme, useThemeStore } from "./src/common/stores/themeStore"
import { useAlertStore } from "./src/alertSystem/alertStore"
import { usePoolStore } from "./src/common/stores/poolStore"
import { mockAxiosDeleteError, mockAxiosGetError, mockAxiosPost, mockAxiosPostError } from "./test/utils/mockAxios"
import { useSearchStore } from "./src/common/stores/searchStore"

beforeEach(() => {
    vi.mock("./src/common/hooks/useStartWebSocket", () => {
        return {
            useStartWebSocket: () => {
                return () => {}
            },
        }
    })
    vi.stubEnv("VITE_BACKEND_URL", "test.server")
    mockAxiosGetError("Network GET event called without mocking it!")
    mockAxiosPostError("Network POST event called without mocking it!")
    mockAxiosDeleteError("Network DELETE event called without mocking it!")
})

afterEach(() => {
    cleanup()
    useTokenStore.setState({ token: null })
    useThemeStore.setState({ theme: Theme.Dark })
    useAlertStore.setState({ alerts: [] })
    usePoolStore.setState({ pool: null, confirmingOverwrite: null, deletingPool: false })
    useSearchStore.setState({
        isOpened: false,
        query: "",
        isPlaylistOpened: true,
        isArtistsOpened: true,
        isAlbumsOpened: true,
        isTracksOpened: true,
    })
})
