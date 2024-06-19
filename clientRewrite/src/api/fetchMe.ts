import { get } from "./methods.ts"

interface fetchMeParameters {
    queryKey: [string, { token: string | null }]
}

export const fetchMe = async ({ queryKey }: fetchMeParameters) => {
    const [_key, { token }] = queryKey
    if (!token) {
        return null
    }
    return await get("/me", token)
}
