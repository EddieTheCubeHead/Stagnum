import { http, HttpResponse } from "msw"
import { TEST_BACKEND_URL } from "../../setup-vitest.ts"
import { mockMeData } from "./data/me.ts"
import { mockedCollectionPoolData } from "./data/pool.ts"
import { mockSearchData } from "./data/search"
import { mockTokenData } from "./data/token.ts"
import { mockLoginData } from "./data/login.ts"

export const defaultToken = "Bearer 12345"

export const get = (url: string, model: Record<string, any> | null) => {
    return http.get(`${TEST_BACKEND_URL}/${url}`, () =>
        HttpResponse.json(model, { headers: { Authorization: defaultToken } }),
    )
}

export const handlers = [
    get("me", mockMeData),
    get("pool", mockedCollectionPoolData),
    get("search", mockSearchData),
    get("auth/login/callback", mockTokenData),
    get("auth/login", mockLoginData),
]
