import { tokenHolder } from "../../src/api/tokenHolder.ts"

export const INITIAL_MOCK_TOKEN = "mockedAccessToken"

export const mockLoginState = (token?: string) => {
    const mockToken = token ?? INITIAL_MOCK_TOKEN
    tokenHolder.setToken(mockToken)
}
