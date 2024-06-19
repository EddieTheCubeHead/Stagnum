import { describe, it, expect, vi } from "vitest"
import { Home } from "../../src/views/Home"
import { render, screen } from "@testing-library/react"
import { TestQueryProvider } from "../utils/TestQueryProvider"
import { mockAxiosGet } from "../utils/mockAxios"
import { useUserStore } from "../../src/common/stores/userStore"
import { useTokenStore } from "../../src/common/stores/tokenStore"

describe("Home", () => {
    // @ts-expect-error
    it("Should set user data after fetch", async () => {
        useTokenStore.setState({ token: "my_test_token_1234" })
        const expectedUser = { user_name: "Test", spotify_id: "1234", icon_url: "my.image.png" }
        mockAxiosGet(expectedUser)
        render(
            <TestQueryProvider>
                <Home />
            </TestQueryProvider>,
        )

        // @ts-expect-error
        await new Promise((r: TimerHandler) => setTimeout(r, 50))
        expect(useUserStore.getState().user).toEqual(expectedUser)
    })
})
