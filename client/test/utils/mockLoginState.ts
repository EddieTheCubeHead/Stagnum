import { vi } from "vitest"
import * as TokenHolder from "../../src/api/tokenHolder.ts"

export const mockLoginState = (token?: string) => {
    const mockToken = token ?? "mockedAccessToken"
    vi.spyOn(TokenHolder, "useToken").mockReturnValue(mockToken)
}
