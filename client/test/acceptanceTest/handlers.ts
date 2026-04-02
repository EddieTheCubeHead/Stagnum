import { delay, http, HttpResponse, ws } from "msw"
import { TEST_BACKEND_URL } from "../../setup-vitest.ts"
import { mockMeData } from "./data/me.ts"
import {
    contentDeletedPool,
    foreignPool,
    mockedCollectionPoolData,
    pausedPool,
    promotedPool,
    sharedPool,
} from "./data/pool.ts"
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

export const getError = (url: string, code: number, message: string, delayAmount?: number | "infinite") => {
    return http.get(`${TEST_BACKEND_URL}/${url}`, async () => {
        if (delayAmount !== undefined) {
            await delay(delayAmount)
        }
        return HttpResponse.json({ error: message }, { status: code })
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

export const delError = (url: string, code: number, message: string, delayAmount?: number | "infinite") => {
    return http.delete(`${TEST_BACKEND_URL}/${url}`, async () => {
        if (delayAmount !== undefined) {
            await delay(delayAmount)
        }
        return HttpResponse.json({ error: message }, { status: code })
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

export const postError = (url: string, code: number, message: string, delayAmount?: number | "infinite") => {
    return http.post(`${TEST_BACKEND_URL}/${url}`, async () => {
        if (delayAmount !== undefined) {
            await delay(delayAmount)
        }
        return HttpResponse.json({ error: message }, { status: code })
    })
}

export const webSocket = ws.link(
    `ws://localhost:3000/${TEST_BACKEND_URL}/websocket/connect?Authorization=mockedAccessToken`,
)

export const handlers = [
    get("me", mockMeData),
    get("pool", mockedCollectionPoolData),
    get("search", mockSearchData),
    get("auth/login/callback", mockTokenData),
    get("auth/login", mockLoginData),
    del("pool/content/*", contentDeletedPool),
    post("pool/leave", null),
    post("pool/playback/pause", pausedPool),
    post("pool/join/*", foreignPool),
    post("pool/share", sharedPool),
    post("pool/promote/*", promotedPool),
    post("pool/demote", mockedCollectionPoolData),
    webSocket.addEventListener("connection", () => {}),
]
