import { afterEach, vi } from "vitest"
import { cleanup } from "@testing-library/react"
import { useTokenStore } from "./src/common/stores/tokenStore"
import { Theme, useThemeStore } from "./src/common/stores/themeStore"
import { useUserStore } from "./src/common/stores/userStore"

afterEach(() => {
    cleanup()
    useTokenStore.setState({ token: null })
    useThemeStore.setState({ theme: Theme.Dark })
    useUserStore.setState({ user: null })
})
