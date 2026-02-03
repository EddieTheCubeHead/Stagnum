import { delay, http, HttpResponse } from "msw"
import { TEST_BACKEND_URL } from "../../setup-vitest.ts"
import { mockMeData } from "./data/me.ts"
import { mockedCollectionPoolData } from "./data/pool.ts"
import { mockSearchData } from "./data/search"
import { mockTokenData } from "./data/token.ts"
import { mockLoginData } from "./data/login.ts"

export const defaultToken = "Bearer 12345"

export const get = (url: string, model: Record<string, any> | null, delayAmount?: number | "infinite") => {
    return http.get(`${TEST_BACKEND_URL}/${url}`, async () => {
        if (delayAmount !== undefined) {
            await delay(delayAmount)
        }
        return HttpResponse.json(model, { headers: { Authorization: defaultToken } })
    })
}

export const del = (url: string, model: Record<string, any> | null, delayAmount?: number | "infinite") => {
    return http.delete(`${TEST_BACKEND_URL}/${url}`, async () => {
        if (delayAmount !== undefined) {
            await delay(delayAmount)
        }
        return HttpResponse.json(model, { headers: { Authorization: defaultToken } })
    })
}

export const post = (url: string, model: Record<string, any> | null, delayAmount?: number | "infinite") => {
    return http.post(`${TEST_BACKEND_URL}/${url}`, async () => {
        if (delayAmount !== undefined) {
            await delay(delayAmount)
        }
        return HttpResponse.json(model, { headers: { Authorization: defaultToken } })
    })
}

export const handlers = [
    get("me", mockMeData),
    get("pool", mockedCollectionPoolData),
    get("search", mockSearchData),
    get("auth/login/callback", mockTokenData),
    get("auth/login", mockLoginData),
    del("pool/content/*", mockedCollectionPoolData),
    post("pool/leave", null),
]
