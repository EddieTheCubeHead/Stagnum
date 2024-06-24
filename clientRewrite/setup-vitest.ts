import { afterEach } from "vitest"
import { cleanup } from "@testing-library/react"
import { useTokenStore } from "./src/common/stores/tokenStore"
import { Theme, useThemeStore } from "./src/common/stores/themeStore"

afterEach(() => {
    cleanup()
    useTokenStore.setState({ token: null })
    useThemeStore.setState({ theme: Theme.Dark })
})
