import { http, HttpResponse } from "msw"
import { TEST_BACKEND_URL } from "../../setup-vitest.ts"
import { mockMeData } from "./data/me.ts"
import { mockedCollectionPoolData } from "./data/pool.ts"

export const defaultToken = "Bearer 12345"

const get = <T>(url: string, model: T) => {
    return http.get(`${TEST_BACKEND_URL}/${url}`, () =>
        HttpResponse.json(model, { headers: { Authorization: defaultToken } }),
    )
}

export const handlers = [get("me", mockMeData), get("pool", mockedCollectionPoolData)]
